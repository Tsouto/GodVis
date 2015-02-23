var dataLoader = {
	makePackageTree:function (data){
		var tree={};
		for (var clazz in data){
			var namespace=data[clazz].namespace.split('.'), actual=tree;
			for (var cIdx in namespace){
				if(actual[namespace[cIdx]]===undefined){
					actual[namespace[cIdx]]={};
				}
				actual=actual[namespace[cIdx]];
			}
			if(actual['childs']===undefined){
				actual['childs']=[];
			}
			actual['childs'].push(data[clazz]);
		}
		return tree;
	},
	applyThreshold:function (data,atfd,wmc,tcc){
		for (var clazz in data){
			var metrics=data[clazz]['metrics'];
			var cTcc=metrics.tcc,cAtfd=metrics.atfd,cWmc=metrics.wmc;
			/*((ATFD, HigherThan(FEW)) and (WMC, HigherThan(VERY_HIGH)) and (TCC, LowerThan(THIRD))*/
			if (cAtfd>=atfd && cWmc>=wmc && cTcc<=tcc){
				metrics['godclass']=true;
			}else{
				metrics['godclass']=false;
			}
		}
		return data;
	},
	fillTable:function (data){
		var table = $('table.tablesorter');
		var body=table.find('tbody');
		body.html('');
		for (var clazz in data){
			var metrics=data[clazz]['metrics'],actual=data[clazz];
			var cTcc=metrics.tcc.toString(),
				cAtfd=metrics.atfd.toString(),
				cWmc=metrics.wmc.toString(),
				loc=metrics.loc.toString(),
				godclass=metrics.godclass.toString();
			if (godclass==="true"){
			body.append('<tr>'
				+'<td>'+actual.namespace+'</td>'
				+'<td>'+actual.name+'</td>'
				+'<td>'+cTcc+'</td>'
				+'<td>'+cAtfd+'</td>'
				+'<td>'+cWmc+'</td>'
				+'<td>'+loc+'</td>'
				+'<td><span class="glyphicon glyphicon-exclamation-sign" value="1"></span><p class="hidden">1</p></td>'
				+'</tr>');
			}else{
							body.append('<tr>'
				+'<td>'+actual.namespace+'</td>'
				+'<td>'+actual.name+'</td>'
				+'<td>'+cTcc+'</td>'
				+'<td>'+cAtfd+'</td>'
				+'<td>'+cWmc+'</td>'
				+'<td>'+loc+'</td>'
				+'<td><span class="glyphicon glyphicon-ok-circle" value="0"></span><p class="hidden">0</p></td>'
				+'</tr>');
			}
		}
		return data;
	},
	generateTreeMapDatasource: function (data){
		tree=this.makePackageTree(data);
		var mapTable=[['Name', 'Parent', 'LOC', 'GodClass']];
		function visit (node,parent){
			for (var name in node) {
	  			if (node.hasOwnProperty(name)) {
	  				if (name!='childs'){
	  					if (parent!=null){
		    				mapTable.push([parent+'.'+name, parent, 0, 0]);
	  						mapTable.concat(visit(node[name],parent+'.'+name));
	  					}else{
	  						mapTable.push([name, parent, 0, 0]);
	  						mapTable.concat(visit(node[name],name));
	  					}
	  				}else{
	  					for (cIdx in node.childs){
		  					clazz=node.childs[cIdx];
		  					if (clazz.metrics.godclass){
			  					mapTable.push([clazz.name, parent, clazz.metrics.loc, 0]);
		  					}else{
		  						mapTable.push([clazz.name, parent, clazz.metrics.loc, 1]);
		  					}
	  					}
	  				}
	  			}
			}
			return mapTable;
		}
		return visit(tree,null);
	},
	loadHistoricalMenu: function(data){
		var dropdown = $('ul.dropdown-menu');
		dropdown.html('');
		for (var name in data) {
	  			if (data.hasOwnProperty(name)) {
	  				dropdown.append('<li><a href="#" onclick="changeData(\''+name+'\');">'+name+'</a></li>');
	  			}
	  		}
	},
	updateCurrentThreshold:function(data){
      var ATFD=$('#atfd').val(),
          WMC=$('#wmc').val(),
          TCC=$('#tcc').val();
      this.applyThreshold(data,parseFloat(ATFD),parseFloat(WMC),parseFloat(TCC));
	},
	update: function (data) {
		this.updateCurrentThreshold(data);
      	this.fillTable(data);
      	$("#smellTable").trigger("update");
      	this.drawChart(data);
      	drawChart();
    },
    drawChart: function (data) {
        var grid = this.generateTreeMapDatasource(data);
        // Create and populate the data table.
        var data = google.visualization.arrayToDataTable(grid);

        // Create and draw the visualization.
        var tree = new google.visualization.TreeMap(document.getElementById('chart_div'));
        tree.draw(data, {
          minColor: '#f00',
          midColor: 'white',
          maxColor: '#0d0',
          maxDepth: 1,
          maxPostDepth: 1,
          headerHeight: 15,
          fontColor: 'black',
          showScale: true});
    },
    historicalDataSource: function(data){
    	var nameByGD = {};
    	for (revision in data){
    		if (data.hasOwnProperty(revision)) {
    			this.updateCurrentThreshold(data[revision]);
    			for (idx in data[revision]){
    				clazz=data[revision][idx];
    				if(clazz.metrics.godclass!=undefined){
    					if (clazz.metrics.godclass){
    						if(nameByGD[clazz.name]===undefined){
    							nameByGD[clazz.name]={};
    						}
    						if(nameByGD[clazz.name]["y"]===undefined){
    							nameByGD[clazz.name]["y"]=1;
    						}else{
    							nameByGD[clazz.name]["y"]+=1;
    						}
    					}else{
    						if(nameByGD[clazz.name]===undefined){
    							nameByGD[clazz.name]={};
    						}
    						if(nameByGD[clazz.name]["n"]===undefined){
    							nameByGD[clazz.name]["n"]=1;
    						}else{
    							nameByGD[clazz.name]["n"]+=1;
    						}
    					}
    				}
    			}
    		}
    	}
    	return nameByGD;
    }
}