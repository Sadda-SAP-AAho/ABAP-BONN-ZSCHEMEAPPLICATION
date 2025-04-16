import Button from "sap/m/Button";
import MessageBox from "sap/m/MessageBox";
import MessageItem from "sap/m/MessageItem";
import MessagePopover from "sap/m/MessagePopover";
import Page from "sap/m/Page";
import ManagedObject from "sap/ui/base/ManagedObject";
import SmartForm from "sap/ui/comp/smartform/SmartForm";
import SmartTable from "sap/ui/comp/smarttable/SmartTable";
import BusyIndicator from "sap/ui/core/BusyIndicator";
import ElementRegistry from "sap/ui/core/ElementRegistry";
import Message from "sap/ui/core/message/Message";
import MessageType from "sap/ui/core/message/MessageType";
import Messaging from "sap/ui/core/Messaging";
import Controller from "sap/ui/core/mvc/Controller";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import UpdateMethod from "sap/ui/model/odata/UpdateMethod";
import ODataModel from "sap/ui/model/odata/v2/ODataModel";


export default class Details extends Controller {

    public schemeDetails: any;
    public odataModel: ODataModel;
    public o_popup: any;
    public _MessageManager = Messaging;
    public oMP: any

    public onInit(): void {
        let oRouter = (this.getOwnerComponent() as any).getRouter()
        oRouter.getRoute("SchemeApplicationView").attachPatternMatched(this.getDetails, this);
    }

    public getDetails(oEvent: any): void {
        BusyIndicator.show();
        let avcLic = window.decodeURIComponent((<any>oEvent.getParameter("arguments")).Scheme),
            regex = /Salesorder='(.*?)',Bukrs='(.*?)'/;
        let match = avcLic.match(regex)
        if (match) {
            this.schemeDetails = {
                Bukrs: match[2],
                Salesorder: match[1],
                full: avcLic
            }
        }

        this.odataModel = new ODataModel("/sap/opu/odata/sap/ZUI_ZSOSCHEME_O2/", {
            defaultCountMode: "None",
            defaultUpdateMethod: UpdateMethod.Merge
        });
        this.odataModel.setDefaultBindingMode("TwoWay");
        this.getView()?.setModel(this.odataModel);

        var that = this;
        this.odataModel.getMetaModel().loaded().then(function () {
            that.byId("smartForm")!.bindElement(`${avcLic}`);
            (that.byId("ImpLinesTable") as SmartTable).bindElement("/zsoscheme");
            (that.byId("ExpLinesTable") as SmartTable).bindElement("/zsoschemelines");
        });

        (this.byId("ImpLinesTable") as SmartTable).rebindTable(true);
        (this.byId("ExpLinesTable") as SmartTable).rebindTable(true);


        this._MessageManager.removeAllMessages();

        this._MessageManager.registerObject(this.byId("smartForm") as ManagedObject, true);
        this.getView()!.setModel(this._MessageManager.getMessageModel(), "message");
        this.createMessagePopover();
        BusyIndicator.hide();

        this.cancelDisable(false);

        this.odataModel.attachRequestCompleted(function (data: any) {
            let reqDetails = data.getParameters();
            let decodedUrl = window.decodeURIComponent(reqDetails.url);

            if (decodedUrl.includes("zsoschemegrouped")) {
                let body = JSON.parse(data.getParameters().response.responseText).d;
                if (reqDetails.method === 'GET' && body.Freeqty !== body.Appliedqty) {
                    (that.byId("_IDGenButton3") as Button).setVisible(true);
                    (that.byId("_IDGenButton15") as Button).setVisible(true);
                    (that.byId("_IDGenButton12") as Button).setVisible(true);
                }
            }
        })

    }

    public onBeforeRebindTable(e: any): void {
        var b = e.getParameter("bindingParams");
        var aDateFilters = [];
        aDateFilters.push(new Filter("Salesorder", FilterOperator.EQ, this.schemeDetails.Salesorder))
        aDateFilters.push(new Filter("Bukrs", FilterOperator.EQ, this.schemeDetails.Bukrs))
        if (!aDateFilters.length) return

        var oOwnMultiFilter = new Filter(aDateFilters, true);
        if (b.filters[0] && b.filters[0].aFilters) {
            var oSmartTableMultiFilter = b.filters[0];
            b.filters[0] = new Filter([oSmartTableMultiFilter, oOwnMultiFilter], true);
        } else {
            b.filters.push(oOwnMultiFilter);
        }
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


    public async onClickDelete() {
        BusyIndicator.show();
        let that = this;

        this.odataModel.read("/zsoscheme", {
            groupId: "deleteAdvLicLines",
            filters: [
                new Filter("Bukrs", FilterOperator.EQ, this.schemeDetails.Bukrs),
                new Filter("Salesorder", FilterOperator.EQ, this.schemeDetails.Salesorder),
            ],
            urlParameters: { "$select": "Schemecode,Schemegroupcode" },
            success: async function (response: any) {
                let schemeCodes = response.results.map((data: any) => {
                    return { Schemecode: data.Schemecode.replace(" ", "%20"), Schemegroupcode: data.Schemegroupcode.replace(" ", "%20") }
                });
                let groupId = "delete-" + that.schemeDetails.Salesorder + "-" + that.schemeDetails.Bukrs;
                that.odataModel.setDeferredGroups([groupId]);
                for (let index = 0; index < schemeCodes.length; index++) {
                    const element = schemeCodes[index];
                    that.odataModel.remove(
                        `/zsoscheme(Bukrs='${that.schemeDetails.Bukrs}',Salesorder='${that.schemeDetails.Salesorder}',Schemecode='${element.Schemecode}',Schemegroupcode='${element.Schemegroupcode}')`, {
                        groupId: groupId,
                        headers: {
                            "If-Match": "*",
                            "Prefer": "handling=strict"
                        }
                    })
                }
                await that.rungroups(that.odataModel, groupId);
                const router = (that.getOwnerComponent() as any).getRouter();
                router.navTo("RouteMaintain");
                BusyIndicator.hide();
            }
        })

    }

    public editEnable() {
        (this.byId("_IDGenButton15") as Button).setVisible(false);
        (this.byId("_IDGenPage4") as Page).setShowFooter(true);

        (this.byId("smartForm") as SmartForm).setEditable(true);
        (this.byId("ImpLinesTable") as SmartTable).setEditable(true);
        (this.byId("ExpLinesTable") as SmartTable).setEditable(true);
    }

    public cancelDisable(showedit = true) {
        if (showedit) (this.byId("_IDGenButton15") as Button).setVisible(true);
        (this.byId("_IDGenPage4") as Page).setShowFooter(false);

        (this.byId("smartForm") as SmartForm).setEditable(false);
        (this.byId("ImpLinesTable") as SmartTable).setEditable(false);
        (this.byId("ExpLinesTable") as SmartTable).setEditable(false);
    }


    public async saveSOLines() {
        let that = this,
            Bukrs = this.schemeDetails.Bukrs,
            Salesorder = this.schemeDetails.Salesorder;


        let newOModel = new ODataModel("/sap/opu/odata/sap/API_SALES_ORDER_SRV");

        let formData = new FormData();
        formData.append("salesorder", Salesorder)
        formData.append("bukrs", Bukrs)

        BusyIndicator.show();
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
                that.odataModel.setDeferredGroups(["OrderLine" + Salesorder]);
                that.odataModel.read("/zsoschemelines", {
                    groupId: "OrderLine" + Salesorder,
                    filters: [
                        new Filter("Salesorder", FilterOperator.EQ, Salesorder),
                        new Filter("Bukrs", FilterOperator.EQ, Bukrs),
                        new Filter("Freeqty", FilterOperator.GT, 0)
                    ]
                })

                let resp2 = await that.rungroups(that.odataModel, "OrderLine" + Salesorder);
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
                        error:function(){
                            MessageBox.error("Something Went Wrong!");
                        }
                    })
                }

                await that.rungroups(newOModel, "addscheme" + Salesorder);

                // update so scheme to change the apply quantity
                let appliedChangingQty = that.transformData(schemeLinesToBeAdded);
                that.odataModel.setDeferredGroups(["updatescheme" + Salesorder]);
                for (let index = 0; index < appliedChangingQty.length; index++) {
                    const element: any = appliedChangingQty[index];

                    that.odataModel.update(
                        `/zsoscheme(Bukrs='${Bukrs}',Salesorder='${Salesorder}',Schemecode='${element.Schemecode.replace(" ", "%20")}',Schemegroupcode='${element.Schemegroupcode.replace(" ", "%20")}')`,
                        { Appliedqty: parseInt(element.Freeqty) },
                        {
                            headers: { "If-Match": "*" },
                            groupId: "updatescheme" + Salesorder,
                            error:function(){
                                MessageBox.error("Something Went Wrong!");
                            }
                        })


                }
                let res = await that.rungroups(that.odataModel, "updatescheme" + Salesorder);
                let schemeLinesToBeAdded1 = resp2.data.__batchResponses[0].data.results
                MessageBox.success("Lines Added to SO");
                (that.byId("_IDGenButton3") as Button).setVisible(false);
                (that.byId("_IDGenButton15") as Button).setVisible(false);
                (that.byId("_IDGenButton12") as Button).setVisible(false);
                BusyIndicator.hide();
            },
            error:function(error:any){
                BusyIndicator.hide();
            }
        });
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


    public async onClickSave() {
        let changes = (this.getView()!.getModel() as any).mChangedEntities;
        let updates = Object.keys(changes);
        var oButton = this.byId("_IDGenButton16") as Button, that = this;

        this._MessageManager.removeAllMessages();
        this.oMP.getBinding("items").attachChange(function (oEvent: any) {
            that.oMP.navigateBack();
            oButton.setType(that.buttonTypeFormatter());
            oButton.setIcon(that.buttonIconFormatter());
            oButton.setText(that.highestSeverityMessages());
        }.bind(this));

        setTimeout(function () {
            that.oMP.openBy(oButton);
        }.bind(this), 100);



        if (updates.length > 0) {
            BusyIndicator.show();
            this.odataModel.setDeferredGroups(["updateDetails"])
            for (let index = 0; index < updates.length; index++) {
                const key = updates[index];
                const value = changes[key];
                this.odataModel.update("/" + key, value, {
                    groupId: "updateDetails"
                })
            }
            let response = await this.rungroups(this.odataModel, "updateDetails");
            BusyIndicator.hide();
        }
        this.cancelDisable();
    }

    public isPositionable(sControlId: any) {
        // Such a hook can be used by the application to determine if a control can be found/reached on the page and navigated to.
        return sControlId ? true : true;
    }

    public getGroupName(sControlId: any) {
        // the group name is generated based on the current layout
        // and is specific for each use case
        var oControl = ElementRegistry.get(sControlId);


        if (oControl) {
            // var sFormSubtitle = oControl.getParent().getParent().getTitle().getText(),
            //     sFormTitle = oControl.getParent().getParent().getParent().getTitle();

            // return sFormTitle + ", " + sFormSubtitle;
            return ""
        }
    }

    public createMessagePopover() {
        var that = this;

        this.oMP = new MessagePopover({
            activeTitlePress: function (oEvent) {
                var oItem = oEvent.getParameter("item"),
                    oPage = that.byId("_IDGenPage4"),
                    oMessage = (oItem as any).getBindingContext("message").getObject(),
                    oControl = ElementRegistry.get(oMessage.getControlId());

                if (oControl) {
                    (oPage as any).scrollToElement(oControl.getDomRef(), 200, [0, -100]);
                    setTimeout(function () {
                        if (oControl!.isFocusable()) {
                            oControl!.focus();
                        }
                    }.bind(this), 300);
                }
            },
            items: {
                path: "message>/",
                template: new MessageItem(
                    {
                        title: "{message>message}",
                        subtitle: "{message>additionalText}",
                        groupName: { parts: [{ path: 'message>controlIds' }], formatter: this.getGroupName },
                        activeTitle: { parts: [{ path: 'message>controlIds' }], formatter: this.isPositionable },
                        type: "{message>type}",
                        description: "{message>message}"
                    })
            },
            groupItems: true
        });


        this.byId("_IDGenButton16")!.addDependent(this.oMP);
    }

    public handleMessagePopoverPress(oEvent: any) {
        if (!this.oMP) {
            this.createMessagePopover();
        }
        this.oMP.toggle(oEvent.getSource());
    }

    public addMessage(message: string, oInput: any, type: MessageType) {
        this._MessageManager.addMessages(
            new Message({
                message: message,
                type: type,
                target: oInput.getBindingPath("value"),
                processor: oInput.getBinding("value").getModel()
            })
        );

    }

    public removeMessageFromTarget(sTarget: any) {
        let that = this;
        this._MessageManager.getMessageModel().getData().forEach(function (oMessage: any) {
            if (oMessage.target === sTarget) {
                that._MessageManager.removeMessages(oMessage);
            }
        }.bind(this));
    }

    public buttonTypeFormatter() {
        var sHighestSeverity: any;
        var aMessages = this._MessageManager.getMessageModel().getData();
        aMessages.forEach(function (sMessage: any) {
            switch (sMessage.type) {
                case "Error":
                    sHighestSeverity = "Negative";
                    break;
                case "Warning":
                    sHighestSeverity = sHighestSeverity !== "Negative" ? "Critical" : sHighestSeverity;
                    break;
                case "Success":
                    sHighestSeverity = sHighestSeverity !== "Negative" && sHighestSeverity !== "Critical" ? "Success" : sHighestSeverity;
                    break;
                default:
                    sHighestSeverity = !sHighestSeverity ? "Neutral" : sHighestSeverity;
                    break;
            }
        });

        return sHighestSeverity;
    }

    public highestSeverityMessages() {
        var sHighestSeverityIconType = this.buttonTypeFormatter();
        var sHighestSeverityMessageType: string = "";

        switch (sHighestSeverityIconType) {
            case "Negative":
                sHighestSeverityMessageType = "Error";
                break;
            case "Critical":
                sHighestSeverityMessageType = "Warning";
                break;
            case "Success":
                sHighestSeverityMessageType = "Success";
                break;
            default:
                sHighestSeverityMessageType = !sHighestSeverityMessageType ? "Information" : sHighestSeverityMessageType;
                break;
        }

        return this._MessageManager.getMessageModel().getData().reduce(function (iNumberOfMessages: any, oMessageItem: any) {
            return oMessageItem.type === sHighestSeverityMessageType ? ++iNumberOfMessages : iNumberOfMessages;
        }, 0) || "";
    }

    public buttonIconFormatter() {
        var sIcon: any;
        var aMessages = this._MessageManager.getMessageModel().getData();

        aMessages.forEach(function (sMessage: any) {
            switch (sMessage.type) {
                case "Error":
                    sIcon = "sap-icon://error";
                    break;
                case "Warning":
                    sIcon = sIcon !== "sap-icon://error" ? "sap-icon://alert" : sIcon;
                    break;
                case "Success":
                    sIcon = sIcon !== "sap-icon://error" && sIcon !== "sap-icon://alert" ? "sap-icon://sys-enter-2" : sIcon;
                    break;
                default:
                    sIcon = !sIcon ? "sap-icon://information" : sIcon;
                    break;
            }
        });

        return sIcon;
    }

}

