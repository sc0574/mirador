(function($) {

  $.ImageView = function(options) {

    jQuery.extend(this, {
      currentImg:       null,
      windowId:         null,
      currentImgIndex:  0,
      canvasID:          null,
      imagesList:       [],
      element:          null,
      elemOsd:          null,
      parent:           null,
      manifest:         null,
      osd:              null,
      fullscreen:       null,
      osdOptions: {
        osdBounds:        null,
        zoomLevel:        null
      },
      osdCls: 'mirador-osd',
      elemAnno:         null,
      annoCls:          'annotation-canvas',
      annotationLayerAvailable: null 
    }, options);

    this.init();
  };

  $.ImageView.prototype = {

    init: function() {    
      // check (for thumbnail view) if the canvasID is set. 
      // If not, make it page/item 1.
      if (this.canvasID !== null) {
        this.currentImgIndex = $.getImageIndexById(this.imagesList, this.canvasID);
      }

      if (!this.osdOptions) {
        this.osdOptions = {
          osdBounds:        null,
          zoomLevel:        null
        };
      }
      this.currentImg = this.imagesList[this.currentImgIndex];
      this.element = jQuery(this.template()).appendTo(this.appendTo);
      this.elemAnno = jQuery('<div/>')
      .addClass(this.annoCls)
      .appendTo(this.element);
      this.createOpenSeadragonInstance($.Iiif.getImageUrl(this.currentImg));
      this.parent.updateFocusImages([this.canvasID]); 
      // The hud controls are consistent 
      // throughout any updates to the osd canvas.
      this.hud = new $.Hud({
        parent: this,
        element: this.element,
        bottomPanelAvailable: this.bottomPanelAvailable,
        windowId: this.windowId,
        annotationLayerAvailable: this.annotationLayerAvailable,
        annoEndpointAvailable: this.annoEndpointAvailable
      });
      //   var can = "";
      // can = $(".openseadragon-canvas");
      // if(can === undefined){
      //   can == "no";
      // }
      // console.log("Can i make image here6?");
      // console.log(can);
    },

    template: Handlebars.compile([
                                 '<div class="image-view">',
                                 '</div>'
    ].join('')),

    setBounds: function() {
      var _this = this;
      console.log("Set bounds called.");
      console.log(this.osd.viewport.getBounds(true));
      this.osdOptions.osdBounds = this.osd.viewport.getBounds(true);
      jQuery.publish("imageBoundsUpdated", {
        id: _this.parent.id, 
        osdBounds: {
          x: _this.osdOptions.osdBounds.x, 
          y: _this.osdOptions.osdBounds.y, 
          width: _this.osdOptions.osdBounds.width, 
          height: _this.osdOptions.osdBounds.height
        }
      });
    },

    toggle: function(stateValue) {
      if (stateValue) { 
        this.show(); 
      } else {
        this.hide();
      }
    },

    hide: function() {
      jQuery(this.element).hide({effect: "fade", duration: 1000, easing: "easeOutCubic"});
    },

    show: function() {
      jQuery(this.element).show({effect: "fade", duration: 1000, easing: "easeInCubic"});
    },

    adjustWidth: function(className, hasClass) {
      if (hasClass) {
        this.parent.element.find('.view-container').removeClass(className);
      } else {
        this.parent.element.find('.view-container').addClass(className);
      }
    },

    adjustHeight: function(className, hasClass) {
      if (hasClass) {
        this.element.removeClass(className);
      } else {
        this.element.addClass(className);
      }
    },

    createOpenSeadragonInstance: function(imageUrl) {
      console.log("On OSD creation with url: "+imageUrl);
      var infoJsonUrl = imageUrl + '/info.json',
      uniqueID = $.genUUID(),
      osdID = 'mirador-osd-' + uniqueID,
      infoJson,
      _this = this;

      this.element.find('.' + this.osdCls).remove();

      //needs tweaking so that it can handle a no .json file present.  it still needs to work.  
      jQuery.getJSON(infoJsonUrl).done(function (infoJson, status, jqXHR) {
        console.log("Got JSON info");
        console.log(infoJson);
        _this.elemOsd =
          jQuery('<div/>')
        .addClass(_this.osdCls)
        .attr('id', osdID)
        .appendTo(_this.element);

        _this.osd = $.OpenSeadragon({
          'id':           osdID,
          'tileSources':  infoJson,
          'uniqueID' : uniqueID
        });

        console.log("_this osd");
        console.log(_this.osd); //Does not have viewport yet. 

        _this.osd.addHandler('open', function(){
          console.log("Looking for options and bounds");
          console.log(_this.osdOptions);
          console.log(_this.osdOptions.osdBounds);
          if (_this.osdOptions.osdBounds) {
            var rect = new OpenSeadragon.Rect(_this.osdOptions.osdBounds.x, _this.osdOptions.osdBounds.y, _this.osdOptions.osdBounds.width, _this.osdOptions.osdBounds.height);
            _this.osd.viewport.fitBounds(rect, true);
          }

          _this.addAnnotationsLayer(_this.elemAnno);
          //re-add correct annotationsLayer mode based on annoState
          if (_this.hud.annoState.current !== "annoOff") {
            jQuery.publish('modeChange.' + _this.windowId, 'displayAnnotations');          
          }

          // A hack. Pop the osd overlays layer after the canvas so 
          // that annotations appear.
          jQuery(_this.osd.canvas).children().first().remove().appendTo(_this.osd.canvas);

          _this.osd.addHandler('zoom', $.debounce(function() {
            _this.setBounds();
          }, 500));

          _this.osd.addHandler('pan', $.debounce(function(){
            _this.setBounds();
          }, 500));
        });
      })
      .fail(function(){
        console.log("No info.json file.  Please handle accordingly.  I am going to make the OSD container.");
        _this.elemOsd =
          jQuery('<div/>')
        .addClass(_this.osdCls)
        .attr('id', osdID)
        .appendTo(_this.element);

        //The only way to attach osd functions is to fake tileSources here so that this builds and OSD instance with a viewport.  

        _this.osd = $.OpenSeadragon({
          'id':           osdID,
          'tileSources':  [], //This is the consequence of not getting the JSON.  It creates the viewport on which the OSD functions are called.  Without it, OSD does not work.
          'uniqueID' : uniqueID
        });

        console.log("_this osd");
        console.log(_this.osd);

        _this.osd.addHandler('open', function(){
          console.log("Looking for options and bounds");
          console.log(_this.osdOptions);
          console.log(_this.osdOptions.osdBounds);
          if (_this.osdOptions.osdBounds) {
            var rect = new OpenSeadragon.Rect(0, 0, 1, 1);
            //_this.osd.viewport.fitBounds(rect, true);
            _this.osd.container.fitBounds(rect, true);
          }

          _this.addAnnotationsLayer(_this.elemAnno);
          //re-add correct annotationsLayer mode based on annoState
          if (_this.hud.annoState.current !== "annoOff") {
            jQuery.publish('modeChange.' + _this.windowId, 'displayAnnotations');          
          }

          // A hack. Pop the osd overlays layer after the canvas so 
          // that annotations appear.
          jQuery(_this.osd.canvas).children().first().remove().appendTo(_this.osd.canvas);

          _this.osd.addHandler('zoom', $.debounce(function() {
            _this.setBounds();
          }, 500));

          _this.osd.addHandler('pan', $.debounce(function(){
            _this.setBounds();
          }, 500));
        });
        
        //wrapping the image element in a canavas causes the image not to load.  Without the canvas, none of the tools work.  
        var fakeCanvas = jQuery("<img class='fix' src='"+imageUrl+"'/>");
        jQuery(_this.osd.canvas).append(fakeCanvas);       
        });
      
    },

    addAnnotationsLayer: function(element) {
      var _this = this;
      _this.annotationsLayer = new $.AnnotationsLayer({
        parent: _this,
        annotationsList: _this.parent.annotationsList || [],
        viewer: _this.osd,
        windowId: _this.windowId,
        element: element
      });

    },

    updateImage: function(canvasID) {
      console.log("Load new full image");
      if (this.canvasID !== canvasID) {
        this.canvasID = canvasID;
        this.currentImgIndex = $.getImageIndexById(this.imagesList, canvasID);
        this.currentImg = this.imagesList[this.currentImgIndex];
        this.osdOptions = {
          osdBounds:        null,
          zoomLevel:        null
        };
        this.osd.close();
        this.createOpenSeadragonInstance($.Iiif.getImageUrl(this.currentImg));
        this.parent.updateFocusImages([canvasID]);
        //by default, don't allow a user to be in edit annotation mode when changing pages
        if (this.hud.annoState.current === "annoOnEditOn") {
          this.hud.annoState.editOff();
        }
      } else {
        this.parent.updateFocusImages([canvasID]);
      }
        // var can2 = "";
        // can2 = $(".openseadragon-canvas");
        // if(can2 === undefined){
        //   can2 == "no";
        // }
        // console.log("Can i make image here3?");
        // console.log(can2);
    },

    next: function() {
      var next = this.currentImgIndex + 1;

      if (next < this.imagesList.length) {
        this.parent.setCurrentCanvasID(this.imagesList[next]['@id']);
      }
    },

    previous: function() {
      var prev = this.currentImgIndex - 1;

      if (prev >= 0) {
        this.parent.setCurrentCanvasID(this.imagesList[prev]['@id']);
      }
    }
  };

}(Mirador));
