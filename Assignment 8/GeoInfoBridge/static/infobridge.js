require([
      "esri/WebMap",
      "esri/views/MapView",
      "esri/widgets/Search",
      "esri/layers/FeatureLayer",
      "esri/widgets/FeatureTable",
      "esri/widgets/Home",
      "esri/widgets/Legend",
      "esri/widgets/LayerList",
      "esri/widgets/Expand",
      "esri/widgets/BasemapGallery",
      "esri/widgets/DistanceMeasurement2D",
      "esri/widgets/Fullscreen",
      "esri/widgets/TimeSlider",
      "esri/widgets/Bookmarks",
      "esri/widgets/Print",
      "esri/widgets/Sketch",
      "esri/layers/GraphicsLayer",
      "esri/widgets/ScaleBar",
      "esri/tasks/Locator",
      "esri/core/watchUtils"
    ], function (
      WebMap, MapView, Search, FeatureLayer,
      FeatureTable, Home, Legend, LayerList, 
      Expand, BasemapGallery, DistanceMeasurement2D, 
      Fullscreen, TimeSlider, Bookmarks, Print, 
      Sketch, GraphicsLayer, ScaleBar,
      Locator, watchUtils
    ) {
      const graphicsLayer = new GraphicsLayer();
      graphicsLayer.title = "Graphics Layer";

      // Accordion pane script
      var acc = document.getElementsByClassName("accordion");
      var panel = document.getElementsByClassName('panel');

      for (var i = 0; i < acc.length; i++) {
        acc[i].addEventListener("click", function() {
        //   this.classList.toggle("active");
        //   panel = this.nextElementSibling;
        
        var setClasses = !this.classList.contains('active');
        setClass(acc, 'active', 'remove');
        setClass(panel, 'show', 'remove');

        if (setClasses) {
            this.classList.toggle("active");
            this.nextElementSibling.classList.toggle("show");
            // panel.style.maxHeight = panel.scrollHeight + "px";
        }

        //   if (panel.style.maxHeight) {
        //     panel.style.maxHeight = null;
        //   } else {
        //     panel.style.maxHeight = panel.scrollHeight + "px";
        //   } 
        });
      }

      function setClass(els, className, fnName) {
        for (var i = 0; i < els.length; i++) {
            els[i].classList[fnName](className);
        }
    }
    // A function is used for dragging and moving
    function dragElement(element, direction)
    {
        var   md; // remember mouse down info
        const first  = document.getElementById("first");
        const second = document.getElementById("second");

        element.onmousedown = onMouseDown;

        function onMouseDown(e)
        {
            //console.log("mouse down: " + e.clientX);
            md = {e,
                    offsetLeft:  element.offsetLeft,
                    offsetTop:   element.offsetTop,
                    firstWidth:  first.offsetWidth,
                    secondWidth: second.offsetWidth
                };

            document.onmousemove = onMouseMove;
            document.onmouseup = () => {
                document.onmousemove = document.onmouseup = null;
            }
        }

        function onMouseMove(e)
        {
            //console.log("mouse move: " + e.clientX);
            var delta = {x: e.clientX - md.e.clientX,
                        y: e.clientY - md.e.clientY};

            if (direction === "H" ) // Horizontal
            {
                // Prevent negative-sized elements
                delta.x = Math.min(Math.max(delta.x, -md.firstWidth),
                            md.secondWidth);

                element.style.left = md.offsetLeft + delta.x + "px";
                first.style.width = (md.firstWidth + delta.x) + "px";
                second.style.width = (md.secondWidth - delta.x) + "px";
            }
        }
    }

      let selectedFeature, id;
      const features = [];

      const webmap = new WebMap({
        portalItem: {
          id: "b05c41435dda4402b5f04b5b2cb788ff"
        },
        layers: [graphicsLayer],
      });

      const view = new MapView({
        map: webmap,
        container: "viewDiv",
        popup: {
          dockEnabled: true,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false
          }
        }
      });

      var homeBtn = new Home({
        view: view
      });

      var scaleBar = new ScaleBar({
        view: view,
        unit: "dual" // The scale bar displays both metric and non-metric units.
      });

      // Add the widget to the bottom left corner of the view
      view.ui.add(scaleBar, {
        position: "bottom-left"
      });

      const bookmarks = new Bookmarks({
        view: view,
        // allows bookmarks to be added, edited, or deleted
        editingEnabled: true
      });

      const bkExpand = new Expand({
        view: view,
        content: bookmarks,
        expanded: false
      })

      view.ui.add(bkExpand, "top-left");

      // bonus - how many bookmarks in the webmap?
      webmap.when(function() {
        if (webmap.bookmarks && webmap.bookmarks.length) {
          console.log("Bookmarks: ", webmap.bookmarks.length);
        } else {
          console.log("No bookmarks in this webmap.");
        }
      });

      // Add the home button to the top left corner of the view
      view.ui.add(homeBtn, "top-left");

      var basemapGallery = new BasemapGallery({
        view: view
      });
      const bgExpand = new Expand({
        view: view,
        content: basemapGallery,
        expanded: false
      });
      // Add the widget to the top-right corner of the view
      view.ui.add(bgExpand, {
        position: "top-left"
      });

      // create a layerlist and expand widget and add to the view
      const layerList = new LayerList({
        view: view
      });
      const llExpand = new Expand({
        view: view,
        content: layerList,
        expanded: false
      });
      view.ui.add(llExpand, "top-right");


      // get the first layer in the collection of operational layers in the WebMap
        var legend = new Legend({
          view: view,
          style: "card"
        });

        const legExpand = new Expand({
          view: view,
          content: legend,
          expanded: false,
        });

        view.ui.add(legExpand, "top-right");

        // To add the DistanceMeasurement2D widget to the map
        var measurementWidget = new DistanceMeasurement2D({
            view: view
        });

        const measExpand = new Expand({
            view: view,
            content: measurementWidget,
            expanded: false,
        });
        
        view.ui.add(measExpand, "top-right");

        view.when(function() {
          var print = new Print({
            view: view,
            // specify your own print service
            printServiceUrl:
              "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
          });

          const printExpand = new Expand({
            view: view,
            content: print,
            expanded: false,
           });
        
          // Add widget to the top right corner of the view
          view.ui.add(printExpand, "top-right");

          const sketch = new Sketch({
            layer: graphicsLayer,
            view: view,
            // graphic will be selected as soon as it is created
            creationMode: "update"
          });
  
          const sketchExpand = new Expand({
            view: view,
            content: sketch,
            expanded: false,
           });
        
            view.ui.add(sketchExpand, {
            position: "top-right",
            index: 2
          });

        });


      // When view is ready, find feature layer and set title and outFields
      view.when(function () {
        var foundLayerId = "";
        webmap.allLayers.find(function(layer) {
            if(layer.title == "Time aware sample"){
              foundLayerId = layer.id
            }
          });
        console.log(foundLayerId)
        const featureLayer = webmap.findLayerById(foundLayerId);
        featureLayer.title = "US Bridges";
        featureLayer.outFields = ["*"];

        // Get references to div elements for toggling table visibility
        const appContainer = document.getElementById("appContainer");
        const tableContainer = document.getElementById("tableContainer");
        const tableDiv = document.getElementById("tableDiv");

        // Create FeatureTable
        const featureTable = new FeatureTable({
          view: view, // make sure to pass in view in order for selection to work
          layer: featureLayer,
          fieldConfigs: [{
                  name: "STRUCTURE_NUMBER_008",
                  label: "Structure Number",
                },{
                name: "YEAR_BUILT_027",
                label: "Year built",
                direction: "desc"
              },
              {
                name: "DECK_COND_058",
                label: "Deck Condition Rating"
              },
              {
                name: "SUPERSTRUCTURE_COND_059",
                label: "Superstructure Condition Rating"
              },
              {
                name: "SUBSTRUCTURE_COND_060",
                label: "Substructure Condition Rating"
              },
              {
                name: "OPERATING_RATING_064",
                label: "Operating Rating"
              },
              {
                name: "INVENTORY_RATING_066",
                label: "Inventory Rating"
              },
              {
                name: "STRUCTURAL_EVAL_067",
                label: "Structural Evaluation"
              }
          ],
          menuConfig: {
            items: [{
              label: "Zoom to feature(s)",
              iconClass: "esri-icon-zoom-in-magnifying-glass",
              clickFunction: function(event) {
                zoomToSelectedFeature();
              }
            }]
          },
          container: tableDiv
        });


        // const searchWidget = new Search({
        //     view: view
        //   });

        const searchWidget = new Search({
          view: view,
          allPlaceholder: "Search",
          includeDefaultSources: false,
          sources: [
            {
              layer: featureLayer,
              searchFields: ["STRUCTURE_NUMBER_008"],
              displayField: "STRUCTURE_NUMBER_008",
              exactMatch: false,
              outFields: ["*"],
              name: "Structure Number",
              placeholder: "Search Structure (Ex.: 010102)",
              zoomScale: 500000,
            },
            // {
            //   name: "ArcGIS World Geocoding Service",
            //   placeholder: "example: Nuuk, GRL",
            //   apiKey: "AAPKd6517aa887304b5891f6b959ea426015CLWBA2qIMPI4-vgwnS0B8RGRBVMArpJu0IN2BUL-G6GZ_aa8NF-r_JvSnsWp_A2M",
            //   singleLineFieldName: "SingleLine",
            //   locator: new Locator({
            //     url: "https://geocode-api.arcgis.com/arcgis/rest/services/World/GeocodeServer"
            //   })
            // }
          ]
        });

        // Adds the search widget below other elements in
        // the top left corner of the view
        view.ui.add(searchWidget, {
          position: "top-left",
          index: 0
        });

        function zoomToSelectedFeature() {
          // Create a query off of the feature layer
            const query = featureLayer.createQuery();
            // Iterate through the features and grab the feature's objectID
            const featureIds = features.map(function(result) {
              return result.feature.getAttribute(featureLayer.objectIdField);
            });
            // Set the query's objectId
            query.objectIds = featureIds;
            // Make sure to return the geometry to zoom to
            query.returnGeometry = true;
            // Call queryFeatures on the feature layer and zoom to the resulting features
            featureLayer.queryFeatures(query).then(function(results) {
              console.log(results.features)
              view.zoomScale = 500000;
              view.goTo(results.features).catch(function(error) {
                view.zoomScale = 500000;
                if (error.name != "AbortError") {
                  console.error(error);
                }
              });
            });
          }


        // Add toggle visibility slider
        view.ui.add(document.getElementById("mainDiv"), {
          position : "top-right",
          index : 0
          });

        var timeSlider = new TimeSlider({
            container: "timeSliderDiv",
            view: view,
            // show data within a given time range
            // in this case data within one year
            mode: "time-window",
            fullTimeExtent: { 
              start: new Date(2014, 0, 1),
              end: new Date(2019, 0, 1)
            },
            // values:[ 
            //   new Date(2000, 0, 1),
            //   new Date(2001, 1, 1)
            // ]
          });

          let timeSliderDropExpand = new Expand({
            collapsedIconClass: "esri-icon-collapse",
            expandIconClass: "esri-icon-expand",
            expandTooltip: "TimeSlider alertas",
            view: view,
            content: timeSlider.container,
            expanded: true
         });
         view.ui.add(timeSliderDropExpand, {
          position: "bottom-right"
        });

        var fullscreen = new Fullscreen({
            view: view
          });

        view.ui.add(fullscreen, {
            position: "bottom-right",
            index: 1
          });

        // Get reference to div elements
        const checkboxEle = document.getElementById("checkboxId");
        const labelText = document.getElementById("labelText");

        // Listen for when toggle is changed, call toggleFeatureTable function
        checkboxEle.onchange = function () {
          toggleFeatureTable();
        };

        function toggleFeatureTable() {
          // Check if the table is displayed, if so, toggle off. If not, display.
          if (!checkboxEle.checked) {
            appContainer.removeChild(tableContainer);
            labelText.innerHTML =
              "Show Attributes";
          } else {
            appContainer.appendChild(tableContainer);
            labelText.innerHTML =
              "Hide Attributes";
          }
        }

        featureLayer.watch("loaded", function(){
          // This function will execute once the promise is resolved
          $('#loading').hide();
          dragElement( document.getElementById("separator"), "H" );
          appContainer.removeChild(tableContainer);
        }, function(error){
          // This function will execute if the promise is rejected due to an error
        });

        featureTable.on("selection-change", function (changes) {

          // If row is unselected in table, remove it from the features array
          changes.removed.forEach(function (item) {
            const data = features.find(function (data) {
              return data.feature === item.feature;
            });
            console.log(data)
            // console.log(features)
            const index = features.indexOf(data);
            console.log(index)
            if (index > -1) {
              features.splice(index, 1);
            }
          });

          // If a row is selected, add to the features array
          changes.added.forEach(function (item) {
            const feature = item.feature;
            features.push({
              feature: feature
            });

            // Listen for row selection in the Attributes. If the popup is open and a row is selected that is not the same feature as opened popup, close the existing popup.
            // if ((feature.attributes.OBJECTID !== id) 
            // && (view.popup.visible === true)
            // ) {
            //   featureTable.deselectRows(selectedFeature);
            //   view.popup.close();
            // }
          });
          // console.log(features)
        });

        // Watch for the popup's visible property. Once it is true, clear the current table selection and select the corresponding table row from the popup
        // watchUtils.watch(view.popup.viewModel, "active", (graphic) => {
        //   selectedFeature = view.popup.selectedFeature;
        //   if ((selectedFeature !== null) 
        //   && (view.popup.visible !== false)
        //   ) {
        //     featureTable.clearSelection();
        //     featureTable.selectRows(view.popup.selectedFeature);
        //     id = selectedFeature.getObjectId();
        //   }
        // });

        $(document).ready(function() {
            //    button click
            $("#generateCR").click(function(){
                generateChart()
            });

            $("#filterCR").click(function(){
              filterfeatures()
          });
        });

        function generateChart(){
            var startDate = new Date(timeSlider.timeExtent.start)
            var endDate = new Date(timeSlider.timeExtent.end)
            console.log(startDate, endDate)
            var feat =  $("input[name='chartFeat']:checked").map(function () {
                return this.value;
            }).get();

            if(feat != ""){
              document.getElementById("chart").style.display = "block";
              var arr = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "N"];
              var resultArr = [];
              var queryArr = [];
              for(i in arr){
                // Create a query off of the feature layer
                const query = featureLayer.createQuery();
                query.returnGeometry = false;
                query.where = feat + " = " + "'" + arr[i] + "'" + " AND YEAR_BUILT_027 = '" + endDate.getUTCFullYear() + "'";
                              // Call queryFeatures on the feature layer and zoom to the resulting features
                featureLayer.queryFeatureCount(query).then(function(numFeatures) {
                  queryArr.push(query.where.split("'")[1])
                  resultArr.push(numFeatures)
                  if(arr.length == resultArr.length){
                      console.log(queryArr, resultArr)
                      // Generate the chart
                      var data = {
                        labels: queryArr,
                        series: resultArr
                      };

                      new Chartist.Bar('.ct-chart', data, 
                      {distributeSeries: true});
                  }
                  
                });
              }
              
          }
          else{
            alert("Please choose the feature and its value!..");
          }
            
        }


        function filterfeatures() {
          var startDate = new Date(timeSlider.timeExtent.start)
          var endDate = new Date(timeSlider.timeExtent.end)
          console.log(startDate, endDate)
          console.log(startDate.getUTCFullYear() + ' - ' + endDate.getUTCFullYear());
           var feat =  $("input[name='featCount']:checked").map(function () {
                        return this.value;
                    }).get();
           var cr_val =  $("#cr_value").map(function () {
                return this.value;
            }).get();

          if(feat != "" && cr_val != "" && cr_val != "0"){
              // Create a query off of the feature layer
              const query = featureLayer.createQuery();
              query.returnGeometry = false;
              query.where = feat + " = " + "'" + cr_val + "'" + " AND YEAR_BUILT_027 = '" + endDate.getUTCFullYear() + "'";
              // Call queryFeatures on the feature layer and zoom to the resulting features
              featureLayer.queryFeatureCount(query).then(function(numFeatures) {
                alert(numFeatures + " features found between the years " + startDate.getUTCFullYear() + " and " + endDate.getUTCFullYear())
              });
          }
          else{
            alert("Please choose the feature and its value!..");
          }
          }
      });
    });