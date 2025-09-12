Node.js based ONVIF Camera/NVT software that turns a Linux computer into an ONVIF Camera and RTSP Server. It implements the key parts of Profile S and Profile T (http://www.onvif.org). It has special support for the Nvidia Jetson.


Runing the WebRTC =>

# remove any old container
sudo docker rm -f go2rtc || true

# ensure config folder exists
sudo mkdir -p /opt/go2rtc

jetson@ubuntu:~$ sudo tee /opt/go2rtc/go2rtc.yaml > /dev/null <<'EOF'
> api:
>   listen: ":1984"
>   origin: "*"
> 
> webrtc:
>   listen: ":8555"
>   ice_servers:
>     - urls: ["stun:stun.l.google.com:19302"]
> 
> rtsp:
>   listen: ":8554"
> 
> log:
>   level: info
>   api: debug
>   rtsp: debug
>   webrtc: debug
>   streams: debug
> 
> streams:
>   # Original streams
>   stream1_original: rtsp://admin:Aragats777@192.168.0.33:3333/stream
>   stream2_original: rtsp://admin:Aragats777@192.168.0.33:1111
>   
>   # WebRTC compatible streams with transcoding
>   stream1: 
>     - rtsp://admin:Aragats777@192.168.0.33:3333/stream
>     - "ffmpeg:stream1_original#video=h264#audio=opus"
>   
>   stream2:
>     - rtsp://admin:Aragats777@192.168.0.33:1111
>     - "ffmpeg:stream2_original#video=h264#audio=opus"
> 
>   # Alternative: Lower quality streams for better compatibility
>   stream1_low:
>     - "ffmpeg:stream1_original#video=h264#audio=opus#width=640#height=480#bitrate=1000k"
>     
>   stream2_low:
>     - "ffmpeg:stream2_original#video=h264#audio=opus#width=640#height=480#bitrate=1000k"
> EOF
jetson@ubuntu:~$ sudo docker rm -f go2rtc
go2rtc
jetson@ubuntu:~$ sudo docker run -d --name go2rtc \
   --network host \
   -v /opt/go2rtc:/config \
   --restart unless-stopped \
   alexxit/go2rtc:latest
a4ccfc0958ab23795f