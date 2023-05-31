class VideoState {
	setVideoData(videoMetaData) {
		console.log(`🧊 ~ videoMetaData: `, videoMetaData);
		this.videoData = videoMetaData;
	}

	getVideoData() {
    if(!this.videoData) { return; }
		return this.videoData;
	}

	setPlayer(playerInstance) {
		console.log(`🧊 ~ playerInstance: `, playerInstance);
		this.player = playerInstance;
	}

  getPlayer(){
    if(!this.player) { return; }
    return this.player
  }
}

export const VS = new VideoState();
