$("#2").hide();


var colors = ['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942']
var areadimChart = dc.pieChart("#areaChart");
var areadimChart2 = dc.pieChart("#areaChart2")
var popdimChart = dc.pieChart("#popCount");
var popdimChart2 = dc.pieChart("#popCount2");
var visCount = dc.dataCount(".dc-data-count");
var visTable = dc.dataTable("#myTable");
var base = "assets/basins_simplified.geojson";
var bcu = 'assets/BCU_simplified.geojson';
var world = 'assets/world.geojson';

var search = null;

var RBO = d3.csv('assets/TFDD_RBODatabase_20131015.csv');
var treaty = d3.csv('assets/WorkingMasterTreatiesDB_20180428.csv');

// create a map object for us to input the map and it's components into.

var map = L.map('map', {zoomControl: false, scrollWheelZoom: true}).setView([40, 0], 1.5);
// L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);



var cover = function (base) {
    map.eachLayer(function (layer) {
        map.removeLayer(layer);
    });

    L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png').addTo(map);


    d3.json(base).then(function (data) {
        d3.json(bcu).then(function (datum) {

            //////////////////////////////////////////////////PREP THE DATA////////////////////////////////////////////////////////
            //create crossfilter passes each feature to the filter
            var filter_basin = crossfilter(data.features); //passes the features to the crossfilter
            var bcufilter = crossfilter(datum.features);


// groups everything together into one group, this is used to quickly search all of the data at once
            var all = filter_basin.groupAll();

            var geometry = filter_basin.dimension(function (d) {
                return d.geometry
            });
            var bcugeometry = bcufilter.dimension(function (d) {
                return d.geometry
            });


//Takes each of the records of the dataset and returns each individual line so that they can be used. .dimension() puts
// the data into an easily searchable/manipulable format for DC
            var everything = filter_basin.dimension(function (d) {
                return d
            });


            var everything2 = bcufilter.dimension(function (d) {
                return d
            });
            var all2 = bcufilter.groupAll();


//////////////////////////////////////////////SORT THE DATA///////////////////////////////////////////////////////////
//returns the geometry for each feature; this is the points at which each earthquake happened
            var popDimension = filter_basin.dimension(function (d) {
                var pop = d.properties.PopDen2015;
                return pop < 50 ? '0-50' :
                    pop < 75 ? '50-75' :
                        pop < 100 ? '75-100' :
                            pop < 125 ? '100-125' :
                                pop < 150 ? '125-150' :
                                    '>150'


            });

            var popdimbcu = bcufilter.dimension(function (d) {
                var pop = d.properties.PopDen2015;
                return pop < 50 ? '0-50' :
                    pop < 75 ? '50-75' :
                        pop < 100 ? '75-100' :
                            pop < 125 ? '100-125' :
                                pop < 150 ? '125-150' :
                                    '>150'
            });


            var areaDim = filter_basin.dimension(function (d) {
                var area = d.properties.Area_km2;
                return area < 10000 ? '0-10000' :
                    area < 20000 ? '10000 - 20000' :


                        area < 30000 ? '20000 - 30000' :
                            area < 40000 ? '30000 - 40000' :
                                area < 50000 ? '40000 - 50000' :
                                    '>50000'
            });

            var areaDim2 = bcufilter.dimension(function (d) {
                var area = d.properties.Area_km2;
                return area < 10000 ? '0-10000' :
                    area < 20000 ? '10000 - 20000' :


                        area < 30000 ? '20000 - 30000' :
                            area < 40000 ? '30000 - 40000' :
                                area < 50000 ? '40000 - 50000' :
                                    '>50000'
            });

            var codeDim = bcufilter.dimension(function (d) {
                return d.properties.BCODE
            });

            var codeGroup = codeDim.group();
/////////////////////////////////////////GROUP THE DATA///////////////////////////////////////////////////////////////
// Now that we have the mag dimension captured in an object we have to group them all together so that we can use them
            var popGroup = popDimension.group();
            var areaGroup = areaDim.group();
            var areaGroup2 = areaDim2.group();
            var popdimbcugroup = popdimbcu.group();

///////////////////////////////////////////////ADD THE MARKERS TO THE MAP///////////////////////////////////////////////

/////////////////////////////////////CREATE THE CHARTS////////////////////////////////////////////////////////////////

            popdimChart
                .slicesCap(4)
                .innerRadius(0)
                .externalLabels(25)
                .externalRadiusPadding(35)
                .drawPaths(true)
                .dimension(popDimension)
                .group(popGroup)
                .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942']);


            popdimChart2
                .slicesCap(4)
                .innerRadius(0)
                .externalLabels(25)
                .externalRadiusPadding(35)
                .drawPaths(true)
                .dimension(popdimbcu)
                .group(popdimbcugroup)
                .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942']);

            areadimChart
                .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942'])
                // .height(200)
                // .width(300)
                .slicesCap(4)
                .innerRadius(0)
                .externalLabels(25)
                .externalRadiusPadding(35)
                .drawPaths(true)
                .dimension(areaDim)
                .group(areaGroup);
            // .elasticX(true);

            areadimChart2
                .ordinalColors(['#afb6bc', '#919ba3', '#53626f', '#374e60', '#2f3942'])
                // .height(200)
                // .width(300)
                .slicesCap(4)
                .innerRadius(0)
                .externalLabels(25)
                .externalRadiusPadding(35)
                .drawPaths(true)
                .dimension(areaDim2)
                .group(areaGroup2);
            // .elasticX(true);

            visCount
                .dimension(filter_basin)
                .group(all);

            visTable
                .dimension(codeDim)
                // .width(500)
                .group(function (d) {
                    return d.properties.Basin_Name
                })

                .columns([
                    function (d) {
                        return d.properties.BCODE
                    },
                    // function (d) {
                    //     return d.properties.Basin_Name
                    // },

                    function (d) {
                        return d.properties.Area_km2
                    },
                    function (d) {
                        return d.properties.PopDen2015
                    },
                    function (d) {
                        return d.properties.Dams_Exist
                    },
                    function (d){
                        return d.properties.adm0_name
                    },
                    function (d) {
                        return d.properties.rbo
                    }
                ]);


            dc.renderAll();

            var geoJsonLayer = L.geoJson({
                type: 'FeatureCollection',
                features: geometry.top(Infinity)//starts selecting from the .top() and goes until...infinity
            }, {
                style: style,

                onEachFeature: onEachFeature
            }).addTo(map);

            var geoJsonLayer2 = L.geoJson({
                type: 'FeatureCollection',
                features: bcugeometry.top(Infinity)//starts selecting from the .top() and goes until...infinity
            }, {
                style: style,

                onEachFeature: onEachFeature2
            });


            function highlightFeature(e) {
                // e indicates the current event
                // var layer = e.target; //the target capture the object which the event associates with
                this.setStyle({
                    weight: 5,
                    opacity: 0.8,
                    color: '#e3e3e3',
                    fillColor: '#12d0e3',
                    fillOpacity: 0.5
                });

                this.bindPopup (e.target.feature.properties.Basin_Name)
                this.openPopup()
            }

            // 3.2.2 zoom to the highlighted feature when the mouse is clicking onto it.
            function zoomToFeature(e) {

                map.fitBounds(e.target.getBounds());
                var basin = e.target.feature.properties.BCODE;
                //var bcu_names = codeDim.filter(basin);

                // geoJsonLayer.clearLayers();
                //  var bcode = e.target.feature.properties.BCODE;

                search = codeDim.filter(basin);
                geoJsonLayer.clearLayers();
                geoJsonLayer2.clearLayers();
                geoJsonLayer2.addData({
                    type: 'FeatureCollection',
                    features: search.top(Infinity)
                }).addTo(map);

                $("#1").hide();
                $("#2").show();

                var bcu = search.top(Infinity);
                bcu_names = "";
                for (var i = 0; i < bcu.length; i++) {

                    bcu_names += bcu[i].properties.adm0_name + ", "

                }
                $('#bcuName').text(bcu_names);
                $('#bcuName2').text(bcu_names);
                $('#basinName').text(e.target.feature.properties.Basin_Name);
                $('#basinName2').text(e.target.feature.properties.Basin_Name);
                $('#damCount').text(e.target.feature.properties.Dams_Exist);
                $('#damCount2').text(e.target.feature.properties.Dams_Exist);
            }


            // 3.2.3 reset the hightlighted feature when the mouse is out of its region.
            function resetHighlight() {
                geoJsonLayer.resetStyle(this);
                this.closePopup()
                // $(".update").html("Hover over a state");
            }

            // 3.3 add these event the layer obejct.
            function onEachFeature(feature, layer) {
                layer.on({
                    mouseover: highlightFeature,
                    click: zoomToFeature,
                    mouseout: resetHighlight
                });
            }
            function highlightFeature2(e) {
                // e indicates the current event
                // var layer = e.target; //the target capture the object which the event associates with
                this.setStyle({
                    weight: 5,
                    opacity: 0.8,
                    color: '#e3e3e3',
                    fillColor: '#12d0e3',
                    fillOpacity: 0.5
                });

                this.bindPopup (e.target.feature.properties.adm0_name)
                this.openPopup()
            }

            function onEachFeature2(feature, layer) {
                layer.on({
                    mouseover: highlightFeature2,
                    // click: zoomToFeature,
                    mouseout: resetHighlight
                });
            };

            function setColor(pop) {
                var id = 0;
                if (pop > 150) {
                    id = 5;
                }
                else if (pop > 125 && pop <= 150) {
                    id = 4;
                }
                else if (pop > 100 && pop <= 125) {
                    id = 3;
                }
                else if (pop > 75 && pop <= 100) {
                    id = 2;
                }
                else if (pop > 50 && pop <= 75) {
                    id = 1;
                }
                else {
                    id = 0;
                }

                return colors[id];
            }

            function style(feature) {
                return {
                    weight: 2,
                    opacity: 1,
                    color: 'black',
                    dashArray: '3',
                    fillOpacity: 0.7,
                    fillColor: setColor(feature.properties.PopDen2015),


                }
            };


            // function cleanChart(filter ){
            //     var popdimfilters = popdimChart.filters();
            //     var areadimfilters = areadimChart.filters();
            //     var vistable = vistable.filters();
            //     popdimChart.filter(null);
            //     areadimChart.filter(null);
            //     filter_basin.remove();
            //     popdimChart.filter([popdimfilters]);
            //     areadimChart.filter([areadimfilters]);
            //     console.log('update charts');
            //
            // }


            function updateMapFilter() {
                geometry.filter(function (d) {
                    return map.getBounds().contains(L.geoJSON(d).getBounds())
                });

                bcugeometry.filter(function (d) {


                    return map.getBounds().contains(L.geoJSON(d).getBounds());

                });


                dc.redrawAll();
            }

            function updateMap() {
                geoJsonLayer.clearLayers();//removes everything
                geoJsonLayer.addData({//adds the new data to the map/chart within the scope of the filter
                    type: 'FeatureCollection',
                    features: everything.top(Infinity)
                });
            };


            function updateMap2() {
                var basinName = $('#basinName2').text();
                geoJsonLayer2.clearLayers();//removes everything
                geoJsonLayer2.addData({//adds the new data to the map/chart within the scope of the filter
                    type: 'FeatureCollection',
                    features: everything2.top(Infinity)
                })
            };


//When the chart is "filtered" it runs the function to update the map
            popdimChart.on('filtered', function (chart, filter) {
                updateMap();//calls the update map function

            });

            popdimChart2.on('filtered', function (chart, filter) {
                updateMap2();//calls the update map function

            });
            areadimChart.on('filtered', function (chart, filter) {
                updateMap();

            });

            areadimChart2.on('filtered', function (chart, filter) {
                updateMap2();

            });

            //
            // dateChart.on('filtered', function(chart, filter) {
            //     updateMap();
            // });
            visTable.on('filtered', function (e) {
                var basin = e.target();
                zoomToFeature(basin)
            });
            visTable.on('filtered', function(){
                updateMap()
            });

            map.on('zoomend moveend', function () {//passes the zoom and move locations as the new filter
                updateMapFilter(); //triggers the new function
            });

        });
    })


};

var tabulate = function (data, columns) {
    // $('.table').removeData()
    var table = d3.select('.table').append('table');
    var thead = table.append('thead');
    var tbody = table.append('tbody');

    thead.append('tr')
        .selectAll('th')
        .data(columns)
        .enter()
        .append('th')
        .text(function (d) {
            return d
        });

    var rows = tbody.selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    var cells = rows.selectAll('td')
        .data(function (row) {
            return columns.map(function (column) {
                return {column: column, value: row[column]}
            })
        })
        .enter()
        .append('td')
        .text(function (d) {
            return d.value
        })


    // var cells = rows.selectAll('td')
    //     .data(rows)
    //     .enter()
    //     .append('td')
    //     .text(function (d) {
    //         return d
    //     })

    return table;

};
//
// var treatyTable = function () {
//     d3.csv("assets/WorkingMasterTreatiesDB_20180428.csv").then(function (data) {
//
//         var columns = ['Basin Name', 'CCODE', 'Issue Area'];
//
//         tabulate(data, columns)
//     })
// }
// var rboTable = function () {
//
//     d3.csv("assets/TFDD_RBODatabase_20131015.csv").then(function (data) {
//
//         var columns = ['RIV_NAME', 'RBO', 'AGREEMENT_NAME'];
//         tabulate(data, columns)
//     })
// };
// //
// var eventsTable = function () {
//     d3.csv("assets/EventMaster111710.csv").then(function (data) {
//
//         var columns = ['BCode', 'COUNTRY_LIST', 'EVENT_TYPE'];
//         tabulate(data, columns)
//     })
// };
/////////////////////////////////////////THE CALLS////////////////////////////////////////////////////////////////////
var treatyTable = function () {
    d3.csv("assets/WorkingMasterTreatiesDB_20180428.csv").then(function (data) {

        var columns = ['Basin Name', 'CCODE','2010_TREATY_DocID'];

        tabulate(data, columns)
    })
}
var rboTable = function () {

    d3.csv("assets/TFDD_RBODatabase_20131015.csv").then(function (data) {

        var columns = ['RIV_NAME', 'RBO', 'AGREEMENT_NAME'];
        tabulate(data, columns)
    })
};
//
var eventsTable = function () {
    d3.csv("assets/EventMaster111710.csv").then(function (data) {

        var columns = ['BCode', 'COUNTRY_LIST', 'EVENT_TYPE'];
        tabulate(data, columns)
    })
};

var giam = function() {
    L.tileLayer('assets/giam/giam/{z}/{x}/{y}.png', {
        maxZoom: 7,
        tms: false,
        attribution: 'Generated by QTiles'
    }).addTo(map)
}

var gmrca = function () {
    L.tileLayer('assets/gmrca/gmrca/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
}





cover(base);
// treatyTable();


////////////////////////////////////////LISTEN FOR CHANGES ON THE MAP//////////////////////////////////////////////////

$(document).ready(function () {
    $("#myInput").on("keyup", function () {


        var value = $(this).val().toLowerCase();

        $("#myTable tr").filter(function () {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });

    });


});

window.onload = function () {
    console.log("window loaded")
    var a = document.getElementById('backbutton');
    a.onclick = function () {
        console.log("button clicked");
        $("#2").hide();
        $("#1").show();
        $(".clear").text("Please select a Basin")


        map.setView([40, 0], 1.5);
        cover(base)


        return false
    }
}

