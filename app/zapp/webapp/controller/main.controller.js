sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/library",
    "sap/ui/comp/library",
    "sap/m/library",
    "sap/ui/model/type/String",
    "sap/m/Token",
    "sap/ui/core/date/UI5Date",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/comp/variants/VariantItem"
], (
    Controller,
    coreLibrary,
    compLibrary,
    mobileLibrary,
    TypeString,
    Token,
    UI5Date,
    JSONModel,
    MessageBox,
    MessageToast,
    VariantItem
) => {
    "use strict";
    const objectId = "FXX1";
    return Controller.extend("zapp.form.com.zapp.controller.main", {

        onInit() {
            this.multiInputFields = ["email"];
            this.sEmail = [];

            this._oVM = this.getView().byId("vm");

            this.api = "http://127.0.0.1:8000";

            this._variants = []
            this._variants.push({ "objectName": objectId, "variantName": "Standard" })

            this.onConnect()
        },
        onConnect: function(){
            fetch(this.api, {
                method: "GET"
            })
                .then(response => response.json())
                .then(data => {
                    // var oModel = new JSONModel(data);
                    // this.getView().setModel(oModel, "api");

                    console.log("API Response:", data);
                    this.getVariants();

                    this._oVM.setVisible(true);
                    this.byId("vm_toggle").setVisible(true);
                    this.byId("vm_retry").setVisible(false);
                    this._showMessagesMessage(`Variant Management Successfully Loaded.`);
                })
                .catch(error => {
                    console.error("FastAPI request failed:", error);
                    this._oVM.setVisible(false);
                    this.byId("vm_toggle").setVisible(false);
                    this._showMessagesMessage(`Variant Failed to load from Backend`);
                    this.byId("vm_retry").setVisible(true);
                });

            console.log(this._variants)
        },
        getVariants: function () {
            let url = `${this.api}/variant/${objectId}`;

            fetch(url, { method: "GET" })
                .then(response => response.json())
                .then(data => {
                    console.log("Variant API Response:", data);

                    if (Array.isArray(data)) {
                        this._loadVariantListFromAPI(data);
                    } else {
                        console.error("API did not return list!");
                    }
                })
                .catch(error => {
                    console.error("FastAPI request failed:", error);
                });
        },

        _loadVariantListFromAPI: function (variantList) {
            const vm = this._oVM;

            // Remove all variants except Standard
            vm.getItems().forEach(item => {
                if (item.getKey() !== "Standard") {
                    vm.removeItem(item);
                    item.destroy();
                }
            });

            // Add each variant returned from API
            variantList.forEach(v => {
                const variantName = v.variantName;

                // skip Standard (already exists)
                if (variantName === "Standard") return;

                // avoid duplicates
                if (vm.getItemByKey(variantName)) return;

                const item = new sap.ui.comp.variants.VariantItem({
                    key: variantName,
                    title: variantName,
                    rename: true,
                    changeable: true,
                    remove: true,
                    sharing: "Public"
                });

                vm.addItem(item);
            });

            console.log("Variants Loaded Into UI5:", vm.getItems());
        },

        // getVariants: function (){  
        //     console.log(1)
        //     let url = `${this.api}/variant/${objectId}`

        //     console.log(url)
        //     fetch(url, {
        //         method: "GET"
        //     })
        //     .then(response => response.json())
        //     .then(data => {
        //         console.log("API Response:", data);
        //         this._variants.push(data)
        //     })
        //     .catch(error => {
        //         console.error("FastAPI request failed:", error);
        //     });
        // },

        onMultipleConditions: function (oEvent) {
            // Get the control that triggered the event
            const sourceControl = oEvent.getSource();

            // Get the ID of the source control
            const controllID = sourceControl.getId();

            let label, key, type;

            // to determine which MultiInput triggered the function.
            if (controllID.includes("email")) {
                console.log("The 'Email' MultiInput triggered the function.");
                label = "Email";
                key = "Email";
                type = "string";
                this.controllID = "email";
            } else {
                console.error(
                    "An unknown MultiInput triggered the function with ID: " +
                    controllID
                );
                return;
            }

            if (label && key && type) {
                this.onMultipleConditionsVHRequested(label, key, type);
            }
        },

        onErrorMessageBoxPress: function () {
            MessageBox.error(
                "Email  & Date are mandatory fields . \nPlease ensure they are filled before submitting .",
                {
                    styleClass: "sapUiResponsivePadding--header sapUiResponsivePadding--content sapUiResponsivePadding--footer"
                }
            );
        },

        // #region Multiple Conditions
        onMultipleConditionsVHRequested: function (label, key, type) {
            const controllID = this.controllID;

            this.loadFragment({
                name: "zapp.form.com.zapp.view.ValueHelpDialogMultipleConditions",
            }).then(
                function (oMultipleConditionsDialog) {
                    switch (controllID) {
                        case "email":
                            this._oMultipleConditionsInput = this.byId(controllID);
                            break;
                        default:
                            console.error(
                                "An unknown MultiInput triggered the function with ID: " +
                                controllID
                            );
                            break;
                    }

                    oMultipleConditionsDialog.setTitle(label);

                    this._oMultipleConditionsDialog = oMultipleConditionsDialog;
                    this.getView().addDependent(oMultipleConditionsDialog);

                    if (label === 'Email') {
                        oMultipleConditionsDialog.setIncludeRangeOperations(
                            [
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EQ
                            ], 'string'
                        );

                        oMultipleConditionsDialog.setExcludeRangeOperations(
                            []
                        );
                    } else {
                        oMultipleConditionsDialog.setIncludeRangeOperations(
                            [
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EQ,
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.BT,
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.GE,
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.GT,
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.LE,
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.LT
                            ], 'string'
                        );

                        oMultipleConditionsDialog.setExcludeRangeOperations(
                            [
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.EQ,
                                sap.ui.comp.valuehelpdialog.ValueHelpRangeOperation.BT,
                            ], 'string'
                        );
                    }


                    oMultipleConditionsDialog.setRangeKeyFields([
                        {
                            label: label,
                            key: key,
                            type: type
                        },
                    ]);

                    oMultipleConditionsDialog.setTokens(
                        this._oMultipleConditionsInput.getTokens()
                    );
                    oMultipleConditionsDialog.open();
                }.bind(this)
            );
        },
        onMultipleConditionsValueHelpOkPress: function (oEvent) {
            const controllID = this.controllID;
            let aTokens = oEvent.getParameter("tokens");
            this._oMultipleConditionsInput.setTokens(aTokens);

            this._oMultipleConditionsDialog.close();
            this.controllID = "";
        },
        onMultipleConditionsCancelPress: function () {
            this._oMultipleConditionsDialog.close();
            this.controllID = "";
        },
        onMultipleConditionsAfterClose: function () {
            this._oMultipleConditionsDialog.destroy();
            this.controllID = "";
        },

        getDataFromToken: function (key) {
            this._oMultipleConditionsInput = this.byId(key);
            let aTokens = this._oMultipleConditionsInput.getTokens();

            let aLocalRange = [];

            aTokens.forEach(function (token) {
                var rangeData = token.data("range");
                if (rangeData) {
                    var sOperation = rangeData.operation;
                    var sSign = rangeData.exclude ? "E" : "I";
                    var sField = rangeData.keyField;
                    var sLow = rangeData.value1;
                    var sHigh = rangeData.value2;

                    sField = sField == "Empty" ? "EQ" : sField;

                    aLocalRange.push({
                        objId: objectId,
                        field: sField,
                        sign: sSign,
                        opt: sOperation,
                        low: sLow,
                        high: sHigh,
                    });
                }
            });

            switch (key) {
                case "email":
                    this.sEmail = aLocalRange;
                    break;
                default:
                    return aLocalRange;
            }
        },

        // #endregion Multiple Conditions

        // #region submit
        onSubmit: function (params) {
            let to_filter = [];

            let dateValue = this.getView().byId("DP8").getValue();

            if (dateValue) {
                dateValue = this.convertToYYYYMMDD(dateValue);
            } else {
                dateValue = this.getCurrentDateYYYYMMDD();
            }

            this.getDataFromToken("email");

            to_filter.push({
                objId: objectId,
                field: "runDate",
                sign: "I",
                opt: "EQ",
                low: dateValue,
                high: null,
            });

            if (!(this.sEmail.length)) {
                // toast , fields are mandatory
                console.error(`Fields Region && Email are mandatory.`);
                this.onErrorMessageBoxPress();
                return;
            }

            this.sEmail ? to_filter.push(...this.sEmail) : null;

            let payload = {
                objId: objectId,
                to_filter: to_filter
            }

            console.log(`Payload: `);
            console.log(payload);

            this._sendDataToBackend(payload);
        },

        _sendDataToBackend: function (payload) {
            const model = this.getView().getModel();

            // model.create("/ZCE_FXX1_Email_Summary", payload, {
            //     success: function (data, response) {
            //         const sapMessage = response.headers["sap-message"];

            //         if (sapMessage) {
            //             const messageObject = JSON.parse(sapMessage);

            //             if (messageObject.severity === "error") {
            //                 this._addMessage(
            //                     "Error",
            //                     "Execution Error",
            //                     "Error encountered while attempting to start the background task: " + messageObject.message
            //                 );
            //                 return;
            //             }
            //         }

            //         this._addMessage("Success", "Execution Success", "Data successfully sent to the backend.");
            //     }.bind(this),
            //     error: function (error) {
            //         this._addMessage("Error", "Execution Error", "Error occurred while sending data to the backend.");
            //         console.error("Backend Error: ", error);
            //     }.bind(this)
            // });
        },

        _addMessage: function (type, title, message) {
            MessageBox.show(message, {
                icon: MessageBox.Icon[type],
                title: title,
                actions: [MessageBox.Action.OK]
            })
        },
        // #endregion submit


        // #region variant handling 
        _showMessagesMessage: function (sMessage) {
            MessageToast.show(sMessage, {
                closeOnBrowserNavigation: true
            });
        },
        _checkCurrentVariant: function () {
            var sSelectedKey = this._oVM.getSelectedKey();
            var oItem = this._oVM.getItemByKey(sSelectedKey);
            if (!oItem) {
                var sKey = this._oVM.getStandardVariantKey();
                if (sKey) {
                    this._oVM.setSelectedKey(sKey);
                }
            }
        },
        _updateItems: function (mParams) {
            if (mParams.deleted) {
                mParams.deleted.forEach(function (sKey) {
                    var oItem = this._oVM.getItemByKey(sKey);
                    if (oItem) {
                        this._oVM.removeItem(oItem);
                        oItem.destroy();
                    }
                }.bind(this));
            }

            // ---- HANDLE RENAMED ----
            if (mParams.renamed) {
                mParams.renamed.forEach(r => {
                    const oldName = r.key;
                    const newName = r.name;

                    // update UI control item
                    const item = this._oVM.getItemByKey(oldName);
                    if (item) {
                        item.setKey(newName);
                        item.setTitle(newName);
                    }

                    // call backend rename
                    this._onVariantRename(oldName, newName);
                });
            }

            // ---- HANDLE DELETED ----
            if (mParams.deleted) {
                mParams.deleted.forEach(function (sKey) {

                    // 1️⃣ block Standard
                    if (sKey === "Standard") {
                        MessageBox.warning("The Standard variant cannot be deleted.");
                        return;
                    }

                    // 2️⃣ remove from UI5
                    var oItem = this._oVM.getItemByKey(sKey);
                    if (oItem) {
                        this._oVM.removeItem(oItem);
                        oItem.destroy();
                    }

                    // 3️⃣ call backend delete API
                    this._deleteVariantFromBackend(sKey);

                }.bind(this));
            }

            // ---- HANDLE DEFAULT ----
            if (mParams.hasOwnProperty("def")) {
                this._oVM.setDefaultKey(mParams.def);
            }

            this._checkCurrentVariant();
        },

        _onVariantRename: function (oldName, newName) {
            const url = `${this.api}/variant/${objectId}/${oldName}/to_${newName}`;

            return fetch(url, {
                method: "POST"
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Variant renamed:", data);
                    this._showMessagesMessage(`Variant renamed to '${newName}'.`);
                })
                .catch(err => {
                    console.error("Rename failed:", err);
                    MessageBox.error("Failed to rename variant.");
                });
        },
        _createNewItem: function (mParams) {
            var sKey = mParams.name; //"key_" + Date.now();

            // var oItem = new VariantItem({
            var oItem = new sap.ui.comp.variants.VariantItem({
                key: sKey,
                title: mParams.name,
                executeOnSelect: mParams.execute,
                author: "",
                changeable: true,
                remove: true
            });

            if (mParams.hasOwnProperty("public") && mParams.public) {
                oItem.setSharing("Public");
                // oItem.setSharing(SharingMode.Public);
            }
            if (mParams.def) {
                this._oVM.setDefaultKey(sKey);
            }

            this._oVM.addItem(oItem);

            this._showMessagesMessage("New view '" + oItem.getTitle() + "' created with key:'" + sKey + "'.");
        },
        onPress: function (event) {
            this._oVM.setModified(!this._oVM.getModified());
        },
        onManage: function (event) {
            var params = event.getParameters();
            this._updateItems(params);
        },
        onSelect: function (event) {
            var params = event.getParameters();
            const variantKey = params.key;

            this._showMessagesMessage("Selected Key: " + variantKey);
            this._oVM.setModified(false);

            // load saved fields from backend

            this._loadVariantData(variantKey);
        },
        onSave: function (event) {
            const params = event.getParameters();
            const variantName = params.name || params.key;

            // collect payload
            const payload = this._collectVariantPayload(variantName);

            // call backend
            fetch(`${this.api}/variant/${objectId}/${variantName}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Variant Saved:", data);

                    if (!params.overwrite) {
                        this._createNewItem(params);   // create new UI entry
                    } else {
                        const oItem = this._oVM.getItemByKey(params.key);
                        this._showMessagesMessage("View '" + oItem.getTitle() + "' updated.");
                    }

                    // reload variant list from backend
                    this.getVariants();
                    this._oVM.setModified(false);
                })
                .catch(err => {
                    console.error("Save Variant Failed:", err);
                    MessageBox.error("Failed to save variant.");
                });

            // var params = event.getParameters();
            // if (params.overwrite) {
            //     var oItem = this._oVM.getItemByKey(params.key);
            //     this._showMessagesMessage("View '" + oItem.getTitle() + "' updated.");
            // } else {
            //     this._createNewItem(params);
            // }

            // this._oVM.setModified(false);
        },
        // #endregion variant handling 


        // #region variant custom

        _deleteVariantFromBackend: function (variantName) {
            if (variantName === "Standard") {
                MessageBox.warning("The Standard variant cannot be deleted.");
                return Promise.resolve();   // do not try backend delete
            }

            const url = `${this.api}/variant/${objectId}/${variantName}`;

            return fetch(url, {
                method: "DELETE"
            })
                .then(res => res.json())
                .then(data => {
                    console.log("Variant Deleted:", data);
                    this._showMessagesMessage(`Variant '${variantName}' deleted.`);
                })
                .catch(err => {
                    console.error("Delete failed:", err);
                    MessageBox.error("Failed to delete variant.");
                });
        },

        _collectVariantPayload: function (variantName) {
            // gather all field data and create payload for backend

            // email tokens
            this.getDataFromToken("email");

            let fields = [];

            // EMAIL FIELD
            if (this.sEmail && this.sEmail.length > 0) {
                fields.push({
                    fieldName: "Email",
                    values: this.sEmail.map(v => ({
                        EXCLUDE: v.sign === "E",
                        OPT: v.opt,
                        LOW: v.low,
                        HIGH: v.high || ""
                    }))
                });
            }

            // RUN DATE FIELD
            const dateValue = this.byId("DP8").getValue();
            if (dateValue) {
                fields.push({
                    fieldName: "runDate",
                    values: [
                        {
                            EXCLUDE: false,
                            OPT: "EQ",
                            LOW: dateValue,
                            HIGH: ""
                        }
                    ]
                });
            }

            return {
                // objectName: objectId,
                // variantName: variantName,
                fields: fields
            };
        },

        _loadVariantData: function (variantName) {
            const url = `${this.api}/variant/${objectId}/${variantName}`;

            if (variantName === 'Standard') {
                this._clearScreen();
                console.log("Screen cleared to Standard. ")
                return
            }

            fetch(url, { method: "GET" })
                .then(response => response.json())
                .then(data => {
                    console.log("Variant Data:", data);

                    if (data && data.fields) {
                        this._applyVariantDataToScreen(data.fields);
                    }
                    console.log("Variant is loaded.")
                })
                .catch(err => console.error("Error loading variant data:", err));
        },
        _clearScreen: function () {
            // this.byId("email").destroyTokens();
            this.byId("email").getTokens().forEach(token => token.destroy());
            this.byId("DP8").setValue("");
        },
        _applyVariantDataToScreen: function (fields) {

            // 1️⃣ Clear existing UI fields
            this._clearScreen();

            // 2️⃣ Loop through fields array
            fields.forEach(field => {
                switch (field.fieldName) {

                    case "Email":
                        this._applyEmailTokens(field.values);
                        break;

                    case "runDate":
                        this._applyRunDate(field.values[0]);
                        break;

                    default:
                        console.log("Unknown field:", field.fieldName);
                }
            });
        },

        _applyEmailTokens: function (values) {
            const emailInput = this.byId("email");

            values.forEach(v => {

                const token = new sap.m.Token({
                    text: v.LOW,
                });

                // attach range info so internal logic still works
                token.data("range", {
                    operation: v.OPT,
                    keyField: "Email",
                    value1: v.LOW,
                    value2: v.HIGH,
                    exclude: v.EXCLUDE
                });

                emailInput.addToken(token);
            });
        },
        _applyRunDate: function (valueObj) {
            // const yyyy = valueObj.LOW.substring(0, 4);
            // const mm = valueObj.LOW.substring(4, 6);
            // const dd = valueObj.LOW.substring(6, 8);

            // const uiDate = `${dd}/${mm}/${yyyy}`;
            this.byId("DP8").setValue(valueObj.LOW);
        },

        // #endregion variant custom



        // date functions
        onClearDate: function (oEvent) {
            const dateValue = this.getView().byId("DP8").getValue();
            console.log(`Date Value Cleared : ${dateValue}`);
            this.getView().byId("DP8").setValue("");
        },

        convertToYYYYMMDD: function (dateStr) {
            const [dd, mm, yyyy] = dateStr.split("/");
            return `${yyyy}${mm}${dd}`;
        },

        getCurrentDateYYYYMMDD: function () {
            const now = new Date();
            const yyyy = now.getFullYear();
            const mm = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
            const dd = String(now.getDate()).padStart(2, "0");
            return `${yyyy}${mm}${dd}`;
        },
    });
});