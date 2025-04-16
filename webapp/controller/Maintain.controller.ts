import Controller from "sap/ui/core/mvc/Controller";
import JSONModel from "sap/ui/model/json/JSONModel";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";
import Control from "sap/ui/core/Control";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import Button from "sap/m/Button";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import Input from "sap/m/Input";
import BusyDialog from "sap/m/BusyDialog";
import Device from "sap/ui/Device";
import ValueHelpDialog from "sap/ui/comp/valuehelpdialog/ValueHelpDialog";
import FilterBar from "sap/ui/comp/filterbar/FilterBar";
import FilterGroupItem from "sap/ui/comp/filterbar/FilterGroupItem";
import Table from "sap/ui/table/Table";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import MessageBox from "sap/m/MessageBox";

/**
 * @namespace newmoduleui.controller
 */
export default class Maintain extends Controller {

    public _pValueHelpDialog: Promise<Control | Control[]> | null = null;
    public selectedAdvLic: string[] = [];
    public oDataModel: ODataModel;
    public oResponsivePaddingDialog: any;
    public _oValueHelpDialog: any;
    public selectedOrder: string = "";
    public errorDialog: boolean = false;


    /*eslint-disable @typescript-eslint/no-empty-function*/
    public onInit(): void {
        var oView;
        this.oDataModel = new ODataModel("/sap/opu/odata/sap/ZUI_ZSOSCHEME_O2/", {
            defaultCountMode: "None"
        });

        this.getView()?.setModel(this.oDataModel);
    }

    public async handleSOValueHelp() {
        var oBusyDialog = new BusyDialog({
            text: "Please wait"
        }),
            that = this;
        oBusyDialog.open();
        if (!this._oValueHelpDialog) {
            var oInput1 = this.byId("SalesOrder") as Input;
            this._oValueHelpDialog = new ValueHelpDialog("SalesOrder2", {
                supportMultiselect: false,
                supportRangesOnly: false,
                stretch: Device.system.phone,
                key: "SalesOrder",
                descriptionKey: "SalesOrder",
                filterMode: true,
                ok: function (oEvent: any) {
                    var valueset = oEvent.mParameters.tokens[0].mAggregations.customData[0].mProperties.value.SalesOrder;
                    that.selectedOrder = valueset;
                    oInput1.setValue(valueset);
                    that._oValueHelpDialog.close();
                },
                cancel: function () {
                    that._oValueHelpDialog.close();
                }
            });

            var oTable = (await this._oValueHelpDialog.getTableAsync()) as unknown as Table;
            var oFilterBar = new FilterBar({
                advancedMode: true,
                filterBarExpanded: true,
                // basicSearch: new SearchField(),
                showGoOnFB: !Device.system.phone,
                filterGroupItems: [new FilterGroupItem({ groupTitle: "foo", groupName: "gn1", name: "n1", label: "Sales Order.", control: new Input() })],
                search: function (oEvt: any) {
                    oBusyDialog.open();
                    var beamno = oEvt.mParameters.selectionSet[0].mProperties.value;
                    if (beamno === "") {
                        oTable.bindRows({
                            path: "/I_SalesOrderStdVH",
                            parameters: { "$top": "5000" },
                        });
                    }
                    else {
                        oTable.bindRows({
                            path: "/I_SalesOrderStdVH",
                            parameters: { "$top": "5000" },
                            filters: [new Filter("SalesOrder", FilterOperator.Contains, beamno)]
                        });
                    }
                    oBusyDialog.close();
                }
            });
            this._oValueHelpDialog.setFilterBar(oFilterBar);
            var oColModel = new JSONModel();
            oColModel.setData({
                cols: [
                    { label: "Sales Order.", template: "SalesOrder" },
                ]
            });
            oTable.setModel(oColModel, "columns");
            var oModel = new ODataModel("/sap/opu/odata/sap/ZUI_ZSOSCHEME_O2/");
            oTable.setModel(oModel);
            oTable.bindRows({
                path: "/I_SalesOrderStdVH",
                parameters: { "$top": "5000" },
            });
        }
        oBusyDialog.close();
        this._oValueHelpDialog.open();
    }


    public onClickCreate(): void {
        let that = this;
        if (!this._pValueHelpDialog) {
            this.loadFragment({
                name: "zschemeapp.view.Fragments.SO",

            }).then(function (oWhitespaceDialog: any) {
                that._pValueHelpDialog = oWhitespaceDialog;
                that.getView()?.addDependent(oWhitespaceDialog);

                oWhitespaceDialog.open();
            }.bind(this));
        } else {
            (this._pValueHelpDialog as any).open()
        }
    }

    public SOInputChange(OEvt: any) {
        this.selectedOrder = OEvt.getSource().getValue();
    }

    public dialogOk() {
        let that = this;
        BusyIndicator.show();
        this.oDataModel.create('/createSOSchemeData', {}, {
            urlParameters: {
                Salesorder: `'${this.selectedOrder}'`
            },
            success: function () {
                (that._pValueHelpDialog as any).close();
                (that.byId("_IDGenSmartTable") as SmartTable).rebindTable(true)
                BusyIndicator.hide();
            },
            error: function () {
                BusyIndicator.hide();
            }
        })

    }

    public onClose() {
        (this._pValueHelpDialog as any).close();
    }

    public showErrorDialog(message: string) {
        let that = this;
        if (!this.errorDialog) {
            that.errorDialog = true;
            MessageBox.error(message, {
                onClose: function () {
                    that.errorDialog = false;
                }
            })
        }
    }

    public onSelectionChange(oEvent: any) {
        let sPath = oEvent.mParameters.listItem.getBindingContext().sPath;
        let body = oEvent.mParameters.listItem.getBindingContext().getObject();
        if (body.Freeqty === body.Appliedqty) return
        if (this.selectedAdvLic.includes(sPath)) this.selectedAdvLic = this.selectedAdvLic.filter(data => data !== sPath)
        else this.selectedAdvLic.push(sPath)

        if (this.selectedAdvLic.length > 0) {
            (this.byId("_IDGenButton5") as Button).setEnabled(true);
            (this.byId("_IDGenButton") as Button).setEnabled(true);
        }
        else {
            (this.byId("_IDGenButton5") as Button).setEnabled(false);
            (this.byId("_IDGenButton") as Button).setEnabled(false);
        }
    }

    public async onClickDelete() {
        let that = this;
        BusyIndicator.show();
        this.oDataModel.setDeferredGroups(["deleteAdvLicLines"]);
        if (this.selectedAdvLic.length > 0) {
            for (let i = 0; i < this.selectedAdvLic.length; i++) {

                let Bukrs: string = "", Salesorder: string = "";
                let regex = /Salesorder='(.*?)',Bukrs='(.*?)'/;
                let match = this.selectedAdvLic[i].match(regex)
                if (match) {
                    Bukrs = match[2];
                    Salesorder = match[1];
                }

                this.oDataModel.read("/zsoscheme", {
                    groupId: "deleteAdvLicLines",
                    filters: [
                        new Filter("Bukrs", FilterOperator.EQ, Bukrs),
                        new Filter("Salesorder", FilterOperator.EQ, Salesorder),
                    ],
                    urlParameters: { "$select": "Schemecode,Schemegroupcode" },
                    success: async function (response: any) {
                        let schemeCodes = response.results.map((data: any) => {
                            return { Schemecode: data.Schemecode.replace(" ","%20"), Schemegroupcode: data.Schemegroupcode.replace(" ","%20") }
                        });
                        let groupId = "delete-" + Salesorder + "-" + Bukrs
                        that.oDataModel.setDeferredGroups([groupId]);
                        for (let index = 0; index < schemeCodes.length; index++) {
                            const element = schemeCodes[index];
                            that.oDataModel.remove(
                                `/zsoscheme(Bukrs='${Bukrs}',Salesorder='${Salesorder}',Schemecode='${element.Schemecode}',Schemegroupcode='${element.Schemegroupcode}')`, {
                                groupId: groupId,
                                headers: {
                                    "If-Match": "*",
                                    "Prefer":"handling=strict"
                                },
                                success: function () {
                                    (that.byId("_IDGenSmartTable") as SmartTable).rebindTable(true);
                                }
                            })
                        }
                        await that.rungroups(that.oDataModel, groupId);
                    }
                })
            }
        }
        let response = await this.rungroups(this.oDataModel, "deleteAdvLicLines");
        (this.byId("_IDGenButton5") as Button).setEnabled(false);
        this.selectedAdvLic = [];
        BusyIndicator.hide();
    }

    public navigate(oEvt: any): void {
        let sPath = oEvt.getSource().getBindingContext().sPath;
        const router = (this.getOwnerComponent() as any).getRouter();
        router.navTo("SchemeApplicationView", {
            Scheme: window.encodeURIComponent(sPath)
        });
    }

    public async saveSOLines() {
        let that = this;
        if (this.selectedAdvLic.length > 0) {
            BusyIndicator.show();
            for (let i = 0; i < this.selectedAdvLic.length; i++) {

                let Bukrs: string = "", Salesorder: string = "";
                let regex = /Salesorder='(.*?)',Bukrs='(.*?)'/;
                let match = this.selectedAdvLic[i].match(regex)
                if (match) {
                    Bukrs = match[2];
                    Salesorder = match[1];
                }

                let newOModel = new ODataModel("/sap/opu/odata/sap/API_SALES_ORDER_SRV");

                let formData = new FormData();
                formData.append("salesorder", Salesorder)
                formData.append("bukrs", Bukrs)

                $.ajax({
                    url: "/sap/bc/http/sap/ZCL_HTTP_SOSCHEME",
                    method: "POST",
                    data: formData,
                    processData: false,
                    contentType: false,
                    success: async function (result: any) {
                        if (result) {
                            MessageBox.error(result);
                            BusyIndicator.hide();
                            return;
                        }

                        // Get plant to add to other lines
                        newOModel.setDeferredGroups(["OrderLine" + Salesorder]);
                        newOModel.read("/A_SalesOrderItem", {
                            groupId: "OrderLine" + Salesorder,
                            filters: [new Filter("SalesOrder", FilterOperator.EQ, Salesorder)],
                            urlParameters: { "$top": "1", }
                        })

                        let resp = await that.rungroups(newOModel, "OrderLine" + Salesorder);
                        let plantToBeEntered = resp.data.__batchResponses[0].data.results[0].ProductionPlant;

                        // get lines for the schemes
                        that.oDataModel.setDeferredGroups(["OrderLine" + Salesorder]);
                        that.oDataModel.read("/zsoschemelines", {
                            groupId: "OrderLine" + Salesorder,
                            filters: [
                                new Filter("Salesorder", FilterOperator.EQ, Salesorder),
                                new Filter("Bukrs", FilterOperator.EQ, Bukrs),
                                new Filter("Freeqty", FilterOperator.GT, 0)
                            ]
                        })

                        let resp2 = await that.rungroups(that.oDataModel, "OrderLine" + Salesorder);
                        let schemeLinesToBeAdded = resp2.data.__batchResponses[0].data.results;


                        // add the lines to the salesorder
                        newOModel.setDeferredGroups(["addscheme" + Salesorder]);
                        for (let index = 0; index < schemeLinesToBeAdded.length; index++) {
                            const element = schemeLinesToBeAdded[index];

                            newOModel.create(`/A_SalesOrder('${Salesorder}')/to_Item`, {
                                Material: element.Productcode,
                                RequestedQuantity: Number(element.Freeqty).toFixed(3),
                                ProductionPlant: plantToBeEntered,
                                SalesOrderItemCategory:'CBXN',
                                YY1_SchemeCode_SDI:element.Schemecheckcode
                            }, {
                                groupId: "addscheme" + Salesorder,
                            })
                        }

                        await that.rungroups(newOModel, "addscheme" + Salesorder);

                        // update so scheme to change the apply quantity
                        let appliedChangingQty = that.transformData(schemeLinesToBeAdded);
                        that.oDataModel.setDeferredGroups(["updatescheme" + Salesorder]);
                        for (let index = 0; index < appliedChangingQty.length; index++) {
                            const element: any = appliedChangingQty[index];

                            that.oDataModel.update(
                                window.encodeURIComponent(`/zsoscheme(Bukrs='${Bukrs}',Salesorder='${Salesorder}',Schemecode='${element.Schemecode}',Schemegroupcode='${element.Schemegroupcode}')`),
                                { Appliedqty: element.Freeqty },
                                {
                                    headers: { "If-Match": "*" },
                                    groupId: "updatescheme" + Salesorder
                                })


                        }
                        await that.rungroups(that.oDataModel, "updatescheme" + Salesorder);
                        (that.byId("_IDGenSmartTable") as SmartTable).rebindTable(true);

                        BusyIndicator.hide();



                    }
                });
            }
        }
    }

    public transformData(inputData: any) {
        let result: any = {};

        inputData.forEach((item: any) => {
            let { Schemecode, Schemegroupcode, Freeqty } = item;

            let key = `${Schemecode}-${Schemegroupcode}`;

            if (!result[key]) {
                result[key] = {
                    Schemecode: Schemecode,
                    Schemegroupcode: Schemegroupcode,
                    Freeqty: 0
                };
            }

            result[key].Freeqty += Freeqty;
        });

        return Object.values(result);
    }

    public async rungroups(OModel: ODataModel, group: string) {
        let res: any = await new Promise((resolve, reject) => {
            OModel.submitChanges({
                groupId: group,
                success: async function (oData: any, oResponse: any) {
                    resolve(oResponse)
                },
                error: function (oError: any) {
                    reject(oError)
                }
            })
        })
        return res;
    };

}
