// Generated by CoffeeScript 1.3.3
(function() {
  var __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  window.ParsedGenesModel = (function(_super) {

    __extends(ParsedGenesModel, _super);

    function ParsedGenesModel() {
      return ParsedGenesModel.__super__.constructor.apply(this, arguments);
    }

    ParsedGenesModel.prototype.initialize = function(parsedGenes) {
      var id;
      this.parsedGenes = parsedGenes;
      this.geneSymbols = _.pluck(this.parsedGenes, "gene_symbol");
      this.geneNames = (function() {
        var _i, _ref, _results;
        _results = [];
        for (id = _i = 1, _ref = this.parsedGenes.length; 1 <= _ref ? _i <= _ref : _i >= _ref; id = 1 <= _ref ? ++_i : --_i) {
          _results.push("gene_" + id);
        }
        return _results;
      }).call(this);
      this.columnNames = this.getColumnNames();
      this.columnGroups = this.getColumnGroups();
      this.geneExpressions = this.getGeneExpressions();
      this.groupedGeneExpressions = this.getGroupedGeneExpressions();
      this.clusters = _.pluck(this.parsedGenes, "cluster");
      return this.clusterNames = this.getClusterNames();
    };

    ParsedGenesModel.prototype.getGeneSymbol = function(geneName) {
      return this.geneSymbols[this.geneNames.indexOf(geneName)];
    };

    ParsedGenesModel.prototype.getColumnGroups = function() {
      return _.chain(this.columnNames).map(function(columnName) {
        return columnName.split("_")[0];
      }).uniq().value();
    };

    ParsedGenesModel.prototype.getExtent = function() {
      var expressions;
      expressions = _.flatten(this.geneExpressions.map(function(geneExpression) {
        return geneExpression.map(function(item) {
          return item.geneExpression;
        });
      }));
      return d3.extent(expressions);
    };

    ParsedGenesModel.prototype.getColumnNames = function() {
      var specialColumnNames,
        _this = this;
      specialColumnNames = /cluster|gene_symbol/;
      return _.keys(this.parsedGenes[0]).filter(function(columnName) {
        return !columnName.match(specialColumnNames);
      });
    };

    ParsedGenesModel.prototype.getGeneExpressions = function() {
      var _this = this;
      return this.parsedGenes.map(function(gene) {
        return _this.columnNames.map(function(columnName) {
          return {
            condition: columnName,
            geneExpression: +gene[columnName]
          };
        });
      });
    };

    ParsedGenesModel.prototype.getGroupedGeneExpressions = function() {
      var _this = this;
      return this.parsedGenes.map(function(gene) {
        var columnGroups, currentGroup, expressions;
        columnGroups = _this.columnGroups.slice(0);
        currentGroup = columnGroups.shift();
        expressions = [];
        _this.columnNames.map(function(columnName) {
          if (!columnName.match(RegExp("^" + currentGroup + "_"))) {
            expressions.push({
              condition: "",
              geneExpression: null
            });
            currentGroup = columnGroups.shift();
          }
          return expressions.push({
            condition: columnName,
            geneExpression: +gene[columnName]
          });
        });
        return expressions;
      });
    };

    ParsedGenesModel.prototype.getClusterNames = function() {
      var clusterFrequencies;
      clusterFrequencies = window.getFrequencies(this.clusters);
      return _.chain(clusterFrequencies).keys().sortBy(function(x) {
        return clusterFrequencies[x];
      }).value().reverse();
    };

    ParsedGenesModel.prototype.getTagFile = function() {
      return "fake_tags.txt";
    };

    return ParsedGenesModel;

  })(Backbone.Model);

}).call(this);