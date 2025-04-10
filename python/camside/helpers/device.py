from config import config


class DeviceEnum:
    VIDEO_SOURCE_1 = f"v4l2src io-mode=2 device={config.get('camera_source_1')}"
    VIDEO_SOURCE_2 = f"v4l2src io-mode=2 device={config.get('camera_source_2')}"
    VIDEO_NVMM_SOURCE_1 = f"nvv4l2camerasrc device={config.get('camera_source_1')}"
    VIDEO_NVMM_SOURCE_2 = f"nvv4l2camerasrc device={config.get('camera_source_2')}"
    TESTSRC_1 = "videotestsrc pattern=18"
    TESTSRC_2 = "videotestsrc pattern=0"

    @classmethod
    def reload(cls):
        cls.VIDEO_SOURCE_1 = f"v4l2src io-mode=2 device={config.get('camera_source_1')}"
        cls.VIDEO_SOURCE_2 = f"v4l2src io-mode=2 device={config.get('camera_source_2')}"
        cls.VIDEO_NVMM_SOURCE_1 = f"nvv4l2camerasrc device={config.get('camera_source_1')}"
        cls.VIDEO_NVMM_SOURCE_2 = f"nvv4l2camerasrc device={config.get('camera_source_2')}"
