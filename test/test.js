var assert = require("chai").assert;
var newick = require ("../index.js");

var tree;
describe ("parse_newick", function () {
    it ('exists', function () {
	assert.isDefined (newick.parse_newick);
    });

    it ('is a function', function () {
	assert.isFunction (newick.parse_newick);
    });

    it ('can read a simple tree', function () {
	tree = newick.parse_newick ('((human, chimp), mouse)');
	assert.isDefined (tree);
    });

    it ('returns a tree of the correct structure', function () {
	assert.property (tree, "name");
	assert.property (tree, "children");
	assert.property (tree.children[0], "name");
	assert.property (tree.children[0], "children");
	assert.strictEqual (tree.children[0].children[0].name, "human"); // implies node order
	assert.notProperty (tree.children[0].children[0], "children");
    });

    it ('reads the branch lengths', function () {
	var tree = newick.parse_newick ('((human:0.2, chimp:0.3)0.1, mouse:0.5)');
	assert.closeTo (tree.children[1].branch_length, 0.5, 0.05);
	assert.closeTo (tree.children[0].children[0].branch_length, 0.2, 0.05);
	assert.closeTo (tree.children[0].children[1].branch_length, 0.3, 0.05);
    });

    it ('reads internal nodes information', function () {
	var tree = newick.parse_newick ('((human:0.2, chimp:0.3)primates:0.1, mouse:0.5)vertebrates:0.7');
	assert.property (tree, "name");
	assert.strictEqual (tree.name, "vertebrates");
	assert.property (tree, "branch_length");
	assert.closeTo (tree.branch_length, 0.7, 0.05);
	assert.property (tree.children[0], "name");
	assert.strictEqual (tree.children[0].name, 'primates');
	assert.property (tree.children[0], "branch_length");
	assert.closeTo (tree.children[0].branch_length, 0.1, 0.05);
    });

	describe('Support to branch labels', function() {
		it('Reads branch label', function() {
			var tree = newick.parse_newick('((human:0.2, chimp:0.3)primates:0.1[30], mouse:0.5)vertebrates:0.7[75]')
			assert.strictEqual(tree.branch_label, "75")
			assert.strictEqual(tree.children[0].branch_label, "30")
		})
		it('Reads branch label as IC/ICA values if branch label in [float,float] format from RAxML trees', function() {
			var tree = newick.parse_newick('((human:0.2, chimp:0.3)primates:0.1[0.30,0.45], mouse:0.5)vertebrates:0.7[0.75,0.79]')
			assert.closeTo(tree.IC, 0.75, 0.05)
			assert.closeTo(tree.ICA, 0.79, 0.05)
			assert.closeTo(tree.children[0].IC, 0.3, 0.05)
			assert.closeTo(tree.children[0].ICA, 0.45, 0.05)
		})
		it('Ignore IC/ICA format if explicitely asked to', function() {
			var tree = newick.parse_newick('((human:0.2, chimp:0.3)primates:0.1[0.30,0.45], mouse:0.5)vertebrates:0.7[0.75,0.79]', IC_ICA = false)
			assert.strictEqual(tree.branch_label, "0.75,0.79")
			assert.strictEqual(tree.children[0].branch_label, "0.30,0.45")
		})
	})
});

describe ("parse_nhx", function () {
    it ('exists', function () {
	assert.isDefined (newick.parse_nhx);
    });

    it ('is a function', function () {
	assert.isFunction (newick.parse_newick);
    });

    it ('can read a simple tree', function () {
	// Current NHX spec: Arbitrary and will probably change in the future
	// D : duplication
	// G : gene_id
	// T : taxon_id
	var tree = newick.parse_nhx ('((human:0.2[&&NHX:val1=9:D=1:G=3:T=4], chimp:0.3)primates:0.1, mouse:0.5)vertebrates:0.7');
	assert.strictEqual (tree.children[0].children[0].name, "human");
	assert.equal (tree.children[0].children[0].val1, 9);
	assert.equal (tree.children[0].children[0].duplication, 1);
	assert.equal (tree.children[0].children[0].gene_id, 3);
	assert.equal (tree.children[0].children[0].taxon_id, 4);
    });
});
