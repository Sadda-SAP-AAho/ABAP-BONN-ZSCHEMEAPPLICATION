/*global QUnit*/
import Controller from "zschemeapp/controller/Maintain.controller";

QUnit.module("Maintain Controller");

QUnit.test("I should test the Maintain controller", function (assert: Assert) {
	const oAppController = new Controller("Maintain");
	oAppController.onInit();
	assert.ok(oAppController);
});