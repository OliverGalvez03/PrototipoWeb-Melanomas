from roboflow import Roboflow
rf = Roboflow(api_key="bIEffQon4i3YDu1Pkmpq")
project = rf.workspace("prueba1-6ybfl").project("melanomas-wppel")
#version = project.version(2)
#dataset = version.download("yolov8")
model = project.version(2).model