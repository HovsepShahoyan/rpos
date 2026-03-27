// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var proto_camera_pb = require('../proto/camera_pb.js');

function serialize_camera_CrossPositionsRequest(arg) {
  if (!(arg instanceof proto_camera_pb.CrossPositionsRequest)) {
    throw new Error('Expected argument of type camera.CrossPositionsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_CrossPositionsRequest(buffer_arg) {
  return proto_camera_pb.CrossPositionsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_CrossPositionsResponse(arg) {
  if (!(arg instanceof proto_camera_pb.CrossPositionsResponse)) {
    throw new Error('Expected argument of type camera.CrossPositionsResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_CrossPositionsResponse(buffer_arg) {
  return proto_camera_pb.CrossPositionsResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_Empty(arg) {
  if (!(arg instanceof proto_camera_pb.Empty)) {
    throw new Error('Expected argument of type camera.Empty');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_Empty(buffer_arg) {
  return proto_camera_pb.Empty.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_ManualGpsRequest(arg) {
  if (!(arg instanceof proto_camera_pb.ManualGpsRequest)) {
    throw new Error('Expected argument of type camera.ManualGpsRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_ManualGpsRequest(buffer_arg) {
  return proto_camera_pb.ManualGpsRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_MovePTZRequest(arg) {
  if (!(arg instanceof proto_camera_pb.MovePTZRequest)) {
    throw new Error('Expected argument of type camera.MovePTZRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_MovePTZRequest(buffer_arg) {
  return proto_camera_pb.MovePTZRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_PTZPositionResponse(arg) {
  if (!(arg instanceof proto_camera_pb.PTZPositionResponse)) {
    throw new Error('Expected argument of type camera.PTZPositionResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_PTZPositionResponse(buffer_arg) {
  return proto_camera_pb.PTZPositionResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_SetSpeedRequest(arg) {
  if (!(arg instanceof proto_camera_pb.SetSpeedRequest)) {
    throw new Error('Expected argument of type camera.SetSpeedRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_SetSpeedRequest(buffer_arg) {
  return proto_camera_pb.SetSpeedRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_SetZoomRequest(arg) {
  if (!(arg instanceof proto_camera_pb.SetZoomRequest)) {
    throw new Error('Expected argument of type camera.SetZoomRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_SetZoomRequest(buffer_arg) {
  return proto_camera_pb.SetZoomRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_StatusResponse(arg) {
  if (!(arg instanceof proto_camera_pb.StatusResponse)) {
    throw new Error('Expected argument of type camera.StatusResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_StatusResponse(buffer_arg) {
  return proto_camera_pb.StatusResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_TelemetryResponse(arg) {
  if (!(arg instanceof proto_camera_pb.TelemetryResponse)) {
    throw new Error('Expected argument of type camera.TelemetryResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_TelemetryResponse(buffer_arg) {
  return proto_camera_pb.TelemetryResponse.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_camera_ZoomResponse(arg) {
  if (!(arg instanceof proto_camera_pb.ZoomResponse)) {
    throw new Error('Expected argument of type camera.ZoomResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_camera_ZoomResponse(buffer_arg) {
  return proto_camera_pb.ZoomResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var CameraServiceService = exports.CameraServiceService = {
  getTelemetry: {
    path: '/camera.CameraService/GetTelemetry',
    requestStream: false,
    responseStream: false,
    requestType: proto_camera_pb.Empty,
    responseType: proto_camera_pb.TelemetryResponse,
    requestSerialize: serialize_camera_Empty,
    requestDeserialize: deserialize_camera_Empty,
    responseSerialize: serialize_camera_TelemetryResponse,
    responseDeserialize: deserialize_camera_TelemetryResponse,
  },
  movePTZ: {
    path: '/camera.CameraService/MovePTZ',
    requestStream: false,
    responseStream: false,
    requestType: proto_camera_pb.MovePTZRequest,
    responseType: proto_camera_pb.StatusResponse,
    requestSerialize: serialize_camera_MovePTZRequest,
    requestDeserialize: deserialize_camera_MovePTZRequest,
    responseSerialize: serialize_camera_StatusResponse,
    responseDeserialize: deserialize_camera_StatusResponse,
  },
  setZoom: {
    path: '/camera.CameraService/SetZoom',
    requestStream: false,
    responseStream: false,
    requestType: proto_camera_pb.SetZoomRequest,
    responseType: proto_camera_pb.StatusResponse,
    requestSerialize: serialize_camera_SetZoomRequest,
    requestDeserialize: deserialize_camera_SetZoomRequest,
    responseSerialize: serialize_camera_StatusResponse,
    responseDeserialize: deserialize_camera_StatusResponse,
  },
  getCurrentZoom: {
    path: '/camera.CameraService/GetCurrentZoom',
    requestStream: false,
    responseStream: false,
    requestType: proto_camera_pb.Empty,
    responseType: proto_camera_pb.ZoomResponse,
    requestSerialize: serialize_camera_Empty,
    requestDeserialize: deserialize_camera_Empty,
    responseSerialize: serialize_camera_ZoomResponse,
    responseDeserialize: deserialize_camera_ZoomResponse,
  },
  setSpeed: {
    path: '/camera.CameraService/SetSpeed',
    requestStream: false,
    responseStream: false,
    requestType: proto_camera_pb.SetSpeedRequest,
    responseType: proto_camera_pb.StatusResponse,
    requestSerialize: serialize_camera_SetSpeedRequest,
    requestDeserialize: deserialize_camera_SetSpeedRequest,
    responseSerialize: serialize_camera_StatusResponse,
    responseDeserialize: deserialize_camera_StatusResponse,
  },
  setManualGps: {
    path: '/camera.CameraService/SetManualGps',
    requestStream: false,
    responseStream: false,
    requestType: proto_camera_pb.ManualGpsRequest,
    responseType: proto_camera_pb.StatusResponse,
    requestSerialize: serialize_camera_ManualGpsRequest,
    requestDeserialize: deserialize_camera_ManualGpsRequest,
    responseSerialize: serialize_camera_StatusResponse,
    responseDeserialize: deserialize_camera_StatusResponse,
  },
  getCrossPositions: {
    path: '/camera.CameraService/GetCrossPositions',
    requestStream: false,
    responseStream: false,
    requestType: proto_camera_pb.CrossPositionsRequest,
    responseType: proto_camera_pb.CrossPositionsResponse,
    requestSerialize: serialize_camera_CrossPositionsRequest,
    requestDeserialize: deserialize_camera_CrossPositionsRequest,
    responseSerialize: serialize_camera_CrossPositionsResponse,
    responseDeserialize: deserialize_camera_CrossPositionsResponse,
  },
  getPTZPosition: {
    path: '/camera.CameraService/GetPTZPosition',
    requestStream: false,
    responseStream: false,
    requestType: proto_camera_pb.Empty,
    responseType: proto_camera_pb.PTZPositionResponse,
    requestSerialize: serialize_camera_Empty,
    requestDeserialize: deserialize_camera_Empty,
    responseSerialize: serialize_camera_PTZPositionResponse,
    responseDeserialize: deserialize_camera_PTZPositionResponse,
  },
};

exports.CameraServiceClient = grpc.makeGenericClientConstructor(CameraServiceService, 'CameraService');
