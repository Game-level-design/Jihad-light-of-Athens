
var EndingScene = defineObject(BaseScene,
{
	_straightFlow: null,
	
	setSceneData: function() {
		// ゲームをクリアしたことを通知する
		root.getSceneController().completeGame();
		
		this._prepareSceneMemberData();
		this._completeSceneMemberData();
	},
	
	moveSceneCycle: function() {
		if (this._straightFlow.moveStraightFlow() !== MoveResult.CONTINUE) {
			root.resetGame();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawSceneCycle: function() {
		this._straightFlow.drawStraightFlow();
	},
	
	_prepareSceneMemberData: function() {
		this._straightFlow = createObject(StraightFlow);
	},
	
	_completeSceneMemberData: function() {
		this._straightFlow.setStraightFlowData(this);
		this._pushFlowEntries(this._straightFlow);
		this._straightFlow.enterStraightFlow();
	},
	
	_pushFlowEntries: function(straightFlow) {
		straightFlow.pushFlowEntry(EndingBlckOutFlowEntry);
		straightFlow.pushFlowEntry(EndingSaveFlowEntry);
		straightFlow.pushFlowEntry(EndingLogoFlowEntry);
	}
}
);

var EndingBlckOutFlowEntry = defineObject(BaseFlowEntry,
{
	_transition: null,
	
	enterFlowEntry: function(endingScene) {
		this._prepareMemberData(endingScene);
		return this._completeMemberData(endingScene);
	},
	
	moveFlowEntry: function() {
		MapLayer.moveMapLayer();
		
		if (this._transition.moveTransition() !== MoveResult.CONTINUE) {
			this._doEndAction();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawFlowEntry: function() {
		MapLayer.drawUnitLayer();
		this._transition.drawTransition();
	},
	
	_prepareMemberData: function(endingScene) {
		this._transition = createObject(SystemTransition);
	},
	
	_completeMemberData: function(endingScene) {
		if (SceneManager.isScreenFilled()) {
			this._doEndAction();
			return EnterResult.NOTENTER;
		}
		
		this._transition.setDestOut();
		this._transition.setFadeSpeed(3);
		
		return EnterResult.OK;
	},
	
	_doEndAction: function() {
		// セーブのために自軍を回復しておく
		UnitProvider.recoveryPlayerList();
		root.resetVisualEventObject();
	}
}
);

var EndingSaveFlowEntry = defineObject(BaseFlowEntry,
{
	_loadSaveScreen: null,
	
	enterFlowEntry: function(endingScene) {
		this._prepareMemberData(endingScene);
		return this._completeMemberData(endingScene);
	},
	
	moveFlowEntry: function() {
		if (SceneManager.isScreenClosed(this._loadSaveScreen)) {
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	drawFlowEntry: function() {
		root.getGraphicsManager().fill(0x0);
	},
	
	_prepareMemberData: function(endingScene) {
	},
	
	_completeMemberData: function(endingScene) {
		var screenParam;
		
		if (!root.getSceneController().isCompletedSaveFlag()) {
			return EnterResult.NOTENTER;
		}
		
		screenParam = this._createScreenParam();
		this._loadSaveScreen = createObject(DataSaveScreen);
		SceneManager.addScreen(this._loadSaveScreen, screenParam);
		
		return EnterResult.OK;
	},
	
	_createScreenParam: function() {
		var screenParam = ScreenBuilder.buildLoadSave();
		
		screenParam.isLoad = false;
		screenParam.mapId = MapIdValue.COMPLETE;
		screenParam.scene = SceneType.REST;
		
		return screenParam;
	}
}
);

var EndingLogoMode = {
	BLACKIN: 0,
	LOGO: 1
};

var EndingLogoFlowEntry = defineObject(BaseFlowEntry,
{
	_transition: null,
	_scrollBackground: null,
	
	enterFlowEntry: function(endingScene) {
		this._prepareMemberData(endingScene);
		return this._completeMemberData(endingScene);
	},
	
	moveFlowEntry: function() {
		var result = MoveResult.CONTINUE;
		var mode = this.getCycleMode();
		
		if (InputControl.isStartAction()) {
			this._doEndAction();
			return MoveResult.END;
		}
		
		if (mode === EndingLogoMode.BLACKIN) {
			result = this._moveBlackin();
		}
		else if (mode === EndingLogoMode.LOGO) {
			result = this._moveLogo();
		}
		
		return result;
	},
	
	drawFlowEntry: function() {
		this._scrollBackground.drawScrollBackground();
		this._transition.drawTransition();
	},
	
	_prepareMemberData: function(endingScene) {
		this._transition = createObject(SystemTransition);
		this._scrollBackground = createObject(ScrollBackground);
	},
	
	_completeMemberData: function(endingScene) {
		MediaControl.musicPlayNew(root.querySoundHandle('endingmusic'));
		
		this._setBackgroundData();
		
		SceneManager.setEffectAllRange(true);
		this._transition.setDestIn();
		this._transition.setFadeSpeed(2);
		this.changeCycleMode(EndingLogoMode.BLACKIN);
		
		return EnterResult.OK;
	},
	
	_setBackgroundData: function() {
		var handle = root.queryGraphicsHandle('endingback');
		var pic = GraphicsRenderer.getGraphics(handle, GraphicsType.SCREENBACK);
		
		this._scrollBackground.startScrollBackground(pic);
	},
	
	_moveBlackin: function() {
		if (this._transition.moveTransition() !== MoveResult.CONTINUE) {
			this.changeCycleMode(EndingLogoMode.LOGO);
		}
		
		return MoveResult.CONTINUE;
	},
	
	_moveLogo: function() {
		if (InputControl.isSelectAction()) {
			this._doEndAction();
			return MoveResult.END;
		}
		
		return MoveResult.CONTINUE;
	},
	
	_doEndAction: function() {
	}
}
);
