from flask import Flask, jsonify, request
import torch
import cv2
import numpy as np
from models.common import DetectMultiBackend
from utils.general import non_max_suppression, scale_boxes
from utils.torch_utils import select_device, smart_inference_mode
from utils.augmentations import letterbox
import PIL.Image
import supervision as sv
import os
from openai import OpenAI
import json
from flask_cors import CORS

app = Flask(__name__)
# CORS(app, resources={r'/*': {'origins': '*'}})

@smart_inference_mode()
def predict_with_labels(image_file=None, weights='yolov9-c.pt', imgsz=640, conf_thres=0.1, iou_thres=0.45, device='0', data='data/coco.yaml'):
    print('Detecting grocery items...')
    # Initialize
    device = select_device(device)
    model = DetectMultiBackend(weights, device=device, fp16=False, data=data)
    stride, names, pt = model.stride, model.names, model.pt

    # Load image
    image = image_file
    img0 = np.array(image)
    assert img0 is not None, f'Image Not Found {image_path}'
    img = letterbox(img0, imgsz, stride=stride, auto=True)[0]
    img = img[:, :, ::-1].transpose(2, 0, 1)
    img = np.ascontiguousarray(img)
    img = torch.from_numpy(img).to(device).float()
    img /= 255.0
    if img.ndimension() == 3:
        img = img.unsqueeze(0)

    # Init bounding box annotator and label annotator
    bounding_box_annotator = sv.BoxAnnotator()
    label_annotator = sv.LabelAnnotator(text_position=sv.Position.CENTER)

    # Inference
    pred = model(img, augment=False, visualize=False)

    # Apply NMS
    pred = non_max_suppression(pred[0][0], conf_thres, iou_thres, classes=None, max_det=1000)

    # Initialize list to store detected labels
    detected_labels = []

    # Process detections
    for i, det in enumerate(pred):
        if len(det):
            det[:, :4] = scale_boxes(img.shape[2:], det[:, :4], img0.shape).round()
            for *xyxy, conf, cls in reversed(det):
                label = f'{names[int(cls)]} {conf:.2f}'
                detected_labels.append(label)  # Append detected label
                # Transform detections to supervisions detections
                detections = sv.Detections(
                    xyxy=torch.stack(xyxy).cpu().numpy().reshape(1, -1),
                    class_id=np.array([int(cls)]),
                    confidence=np.array([float(conf)])
                )

                # Labels
                labels = [
                    f"{class_id} {confidence:0.2f}"
                    for class_id, confidence
                    in zip(detections.class_id, detections.confidence)
                ]

                img0 = bounding_box_annotator.annotate(img0, detections)
                img0 = label_annotator.annotate(img0, detections, labels)

    return img0[:, :, ::-1], detected_labels

def get_expiration_days(groceries):

    food_to_expiry = {
        "apple": 30,
        "banana": 5,
        "orange": 30,
        "broccoli": 5,
        "carrot": 25,
        "pizza": 4,
    }
    result = {
        "groceries": []
    }
    for grocery in groceries:
        if grocery in food_to_expiry:
            result["groceries"].append({
                "name": grocery,
                "daysLeft": food_to_expiry[grocery]
            })
    return result

   

@app.route("/upload", methods=["POST"])
def upload():
    HOME = os.getcwd()
    image_file = request.files['image']
    image_file = PIL.Image.open(image_file)
    img, detected_labels = predict_with_labels(image_file=image_file, weights=os.path.join(HOME, 'server', 'weights', 'yolov9-e.pt'))
    detected_labels = [label.split()[0] for label in detected_labels]
    detected_labels = list(set(detected_labels))
    print('Detected labels:', detected_labels)
    # detected_labels = ["apple", "banana", "orange", "broccoli", "carrot", "pizza"]
    expiration_days = get_expiration_days(detected_labels)
    print('Expiration days:', expiration_days)
    return jsonify(expiration_days)

@app.route("/add-grocery", methods=["POST"])
def get_expiration():
    grocery = request.get_json().get('groceryName')
    print('calculating expiration for grocery:', grocery)
    client = OpenAI()
    prompt = f'Given this grocery item: {grocery}, return JSON with the property isFood, a boolean indiciating if the object is even food, and the property daysLeft, an integer indicating how many days until the food expires. If the object is food, you must return an integer for daysLeft.'
    print('prompt:', prompt)
    completion = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are an assistant that only speaks JSON. Do not write normal text."},
            {"role": "user", "content": prompt}
        ]
    )

    return json.loads(completion.choices[0].message.content)
    
@app.route("/test")
def test():
    print('called test route')
    return jsonify({"message": "success"})



