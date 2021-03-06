// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.HeatmapView = (function(_super) {

    __extends(HeatmapView, _super);

    function HeatmapView() {
      return HeatmapView.__super__.constructor.apply(this, arguments);
    }

    HeatmapView.prototype.initialize = function() {
      var _this = this;
      if (!this.model.get("hideHeatmap")) {
        this.render();
        this.model.on("change:currentRow", function() {
          return _this.showCurrentRow();
        });
        this.model.on("change:clickedRow", function() {
          return _this.showClickedRow();
        });
        this.model.on("change:currentCluster", function() {
          return _this.showCurrentCluster();
        });
        return this.model.on("change:currentTag", function() {
          return _this.showCurrentTag();
        });
      }
    };

    HeatmapView.prototype.events = function() {
      return {
        "mouseover .cell": "changeCurrentRow",
        "mouseout .row": "changeCurrentRow",
        "click .row": "changeClickedRow",
        "click .tag": "changeCurrentTag",
        "click .tag_name": "changeCurrentTag"
      };
    };

    HeatmapView.prototype.render = function() {
      var columnName, geneSymbol,
        _this = this;
      this.heatmapColor = d3.scale.linear().domain([-1.5, 0, 1.5]).range(["#278DD6", "#fff", "#d62728"]);
      this.geneTextScaleFactor = 15;
      this.columnTextScaleFactor = 10;
      this.columnNamesMargin = d3.max((function() {
        var _i, _len, _ref, _results;
        _ref = this.model.columnNames;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          columnName = _ref[_i];
          _results.push(columnName.length);
        }
        return _results;
      }).call(this));
      this.geneSymbolsMargin = d3.max((function() {
        var _i, _len, _ref, _results;
        _ref = this.model.geneSymbols;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          geneSymbol = _ref[_i];
          _results.push(geneSymbol.length);
        }
        return _results;
      }).call(this));
      this.margin = {
        top: 250,
        right: this.calculateRightMargin(),
        bottom: 50,
        left: 50
      };
      this.cellSize = 25;
      this.width = this.cellSize * this.model.columnNames.length;
      this.height = this.cellSize * this.model.geneSymbols.length;
      this.heatmap = d3.select(this.el).attr("width", this.width + this.margin.right + this.margin.left).attr("height", this.height + this.margin.top + this.margin.bottom).append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
      this.x = d3.scale.ordinal().domain(d3.range(this.model.geneExpressions[0].length)).rangeBands([0, this.width]);
      this.y = d3.scale.ordinal().domain(d3.range(this.model.geneSymbols.length)).rangeBands([0, this.height]);
      this.columns = this.heatmap.selectAll(".column").data(this.model.columnNames).enter().append("g").attr("class", "column");
      this.columns.append("text").attr("x", 6).attr("y", this.x.rangeBand() / 2).attr("dy", "-.5em").attr("dx", ".5em").attr("text-anchor", "start").attr("transform", function(d, i) {
        return "translate(" + (_this.x(i)) + ") rotate(-45)";
      }).text(function(d, i) {
        return _this.model.columnNames[i];
      });
      this.addRows();
      if (this.options.showTags !== 0) {
        this.addTags();
      }
      this.$("rect.cell").tooltip({
        title: function() {
          return this.__data__.condition.split("_").join(" ") + "<br>" + d3.round(this.__data__.geneExpression, 2);
        },
        placement: "top"
      });
      return this.$("rect.tag").tooltip({
        title: function() {
          return this.__data__;
        },
        placement: "top"
      });
    };

    HeatmapView.prototype.calculateRightMargin = function() {
      var maxGeneSymbolLength;
      maxGeneSymbolLength = d3.max(this.model.geneSymbols.map(function(x) {
        return x.length;
      }));
      return maxGeneSymbolLength * 12;
    };

    HeatmapView.prototype.addRows = function() {
      var getRow, rows, that,
        _this = this;
      that = this;
      getRow = function(row) {
        var cell,
          _this = this;
        return cell = d3.select(this).selectAll(".cell").data(row).enter().append("rect").attr("class", "cell").attr("x", function(d, i) {
          return that.x(i);
        }).attr("width", that.x.rangeBand()).attr("height", that.x.rangeBand()).text(function(d) {
          return d;
        }).style("fill", function(d) {
          return that.heatmapColor(d.geneExpression);
        });
      };
      rows = this.heatmap.selectAll(".row").data(this.model.geneExpressions).enter().append("g").attr("class", "row").attr("name", function(d, i) {
        return _this.model.geneNames[i];
      }).attr("cluster", function(d, i) {
        return _this.model.clusters[i];
      }).attr("transform", function(d, i) {
        return "translate(0," + (_this.y(i)) + ")";
      }).each(getRow);
      if (!this.model.get("hideRows")) {
        return rows.append("text").attr("x", this.width + this.calculateRightMargin()).attr("y", this.x.rangeBand() / 2).attr("dy", ".32em").attr("text-anchor", "end").text(function(d, i) {
          return _this.model.geneSymbols[i];
        });
      }
    };

    HeatmapView.prototype.addTags = function() {
      var heatmapWidth, maxTagNameLength, tagMargin, tagNames, tagScale, tagSize, tags,
        _this = this;
      tags = "";
      $.ajax({
        url: this.model.getTagFile(),
        context: document.body,
        async: false,
        success: function(data) {
          return tags = window.parseTags(data);
        }
      });
      tagNames = window.getTagNames(tags);
      maxTagNameLength = d3.max(tagNames.map(function(x) {
        return x.length;
      })) * 12;
      tagSize = this.cellSize / 2;
      tagMargin = 12;
      heatmapWidth = d3.select("#heatmap").node().offsetWidth;
      tagScale = d3.scale.ordinal().domain(d3.range(tagNames.length)).rangeBands([0, (tagNames.length - 1) * (tagSize + tagMargin)]);
      this.heatmap.selectAll(".row").selectAll(".tag").data(function(d, i) {
        return tags[_this.model.geneSymbols[i]];
      }).enter().append("rect").attr("class", "tag").attr("x", heatmapWidth).attr("y", this.x.rangeBand() / 4).attr("transform", function(d, i) {
        return "translate(" + tagScale(tagNames.indexOf(d)) + ",0)";
      }).attr("width", this.x.rangeBand() / 2).attr("height", this.x.rangeBand() / 2).attr("name", function(d) {
        return d;
      }).text(function(d) {
        return d;
      }).style("fill", function(d, i) {
        return window.tagColor(d);
      }).style("stroke", "none");
      this.heatmap.selectAll(".tag_name").data(tagNames).enter().append("text").attr("class", "tag_name").attr("dx", heatmapWidth + 10).attr("dy", 0).attr("transform", function(d, i) {
        return "translate(" + tagScale(tagNames.indexOf(d)) + (",0) rotate(-45 " + heatmapWidth + " 0)");
      }).attr("text-anchor", "start").attr("name", function(d) {
        return d;
      }).text(function(d) {
        return d;
      }).attr("fill", "black");
      return d3.select("#heatmap").attr("width", parseInt(d3.select("#heatmap").attr("width")) + tagNames.length * 25 + 100);
    };

    HeatmapView.prototype.changeCurrentRow = function(e) {
      e.stopPropagation();
      return this.model.set({
        currentRow: e.type === "mouseover" ? d3.select(e.target.parentNode).attr("name") : null
      });
    };

    HeatmapView.prototype.changeClickedRow = function(e) {
      e.stopPropagation();
      return this.model.set({
        clickedRow: d3.select(e.target.parentNode).attr("name")
      });
    };

    HeatmapView.prototype.changeCurrentTag = function(e) {
      var currentTag;
      e.stopPropagation();
      this.model.attributes['currentCluster'] = null;
      d3.selectAll(".clusters span").classed("current", 0);
      d3.selectAll(".tag_name").classed("current", 0);
      currentTag = d3.select(e.target);
      if (currentTag && this.model.get("currentTag") === currentTag.attr("name")) {
        return this.model.set({
          currentTag: null
        });
      } else {
        d3.selectAll(".tag_name[name=" + (currentTag.text()) + "]").classed("current", 1);
        return this.model.set({
          currentTag: currentTag.text()
        });
      }
    };

    HeatmapView.prototype.showCurrentRow = function() {
      var currentGene, currentRow;
      d3.selectAll(".row").filter(":not(.clicked)").classed("current", 0);
      currentRow = this.model.get("currentRow");
      if (currentRow != null) {
        currentGene = this.heatmap.select("[name=" + currentRow + "]");
        return currentGene.classed("current", 1);
      }
    };

    HeatmapView.prototype.showClickedRow = function() {
      var clickedGene, clickedRow;
      clickedRow = this.model.get("clickedRow");
      if (clickedRow != null) {
        clickedGene = this.heatmap.select("[name=" + clickedRow + "]");
        d3.select("#pcp").style("top", Math.max(150, clickedGene.filter(".row").node().offsetParent.scrollTop) + 50);
        this.removeClickedRow();
        return clickedGene.classed("current clicked", 1);
      }
    };

    HeatmapView.prototype.removeClickedRow = function() {
      return d3.selectAll(".row").classed("current clicked", 0);
    };

    HeatmapView.prototype.showCurrentCluster = function() {
      var currentCluster, rowsToUpdate,
        _this = this;
      currentCluster = this.model.get("currentCluster");
      $(".row").hide();
      if (currentCluster) {
        rowsToUpdate = this.heatmap.selectAll(".row[cluster='" + currentCluster + "']");
      } else {
        rowsToUpdate = this.heatmap.selectAll(".row");
      }
      $(rowsToUpdate[0]).show();
      return rowsToUpdate.attr("transform", function(d, i) {
        return "translate(0," + (_this.y(i)) + ")";
      });
    };

    HeatmapView.prototype.showCurrentTag = function() {
      var currentTag, rowsToUpdate,
        _this = this;
      currentTag = this.model.get("currentTag");
      $(".row").hide();
      if (currentTag) {
        rowsToUpdate = d3.selectAll($(".tag[name='" + currentTag + "']").parent());
      } else {
        rowsToUpdate = this.heatmap.selectAll(".row");
      }
      $(rowsToUpdate[0]).show();
      return rowsToUpdate.attr("transform", function(d, i) {
        return "translate(0," + (_this.y(i)) + ")";
      });
    };

    return HeatmapView;

  })(Backbone.View);

}).call(this);
