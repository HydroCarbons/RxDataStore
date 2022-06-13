import { RxDataStore } from "./index.js";
//------------------------------------------------------------------------------
let init_data = {
  "name": "John Doe",
  "address": {
    "street": "10th St.",
    "city": "SFO",
    "zip": "94011"
  },
  "meetings": {
    "1:1": {
      "weekday": "Mon"
    }
  },
  "thermostate": true,
  "timer": 0
}
//------------------------------------------------------------------------------
let rxData = new RxDataStore(init_data, "instant");
//------------------------------------------------------------------------------
rxData.subscribe("Subscriber-A", (dataObject)=>{
  console.log("[*] Subscriber-A Action =", dataObject.action, ", Path =", dataObject.path, ", New Value =", dataObject.value);
});

rxData.subscribe("Subscriber-B", (dataObject)=>{
  console.log("[*] Subscriber-B Action =", dataObject.action, ", Path =", dataObject.path, ", New Value =", dataObject.value);
});

rxData.subscribePath("Subscriber-C", "address.street", (dataObject)=>{
  console.log("[*] Subscriber-C Action =", dataObject.action, ", Path =", dataObject.path, ", New Value =", dataObject.value);
});
//------------------------------------------------------------------------------

let current_value = rxData.get();
console.log("RxDataStore =", current_value);

let specific_path_value = rxData.getPath("address.street");
console.log("address.street value =", specific_path_value);

rxData.update("timer", 1+rxData.getPath("timer"));
rxData.update("address.street", "Palm Ave");
rxData.update("address.street", "Palm Avenue");
rxData.update("address.zip", "95011");

rxData.delete("address.street");
rxData.delete("address");

rxData.update("timer", 1+rxData.getPath("timer"));
rxData.update("timer", 1+rxData.getPath("timer"));

rxData.cycle("meetings.1:1.weekday", ["Mon", "Tue", "Wed", "Thur", "Fri", "Sat", "Sun"]);

rxData.cycle("thermostate", [true, false]);
rxData.cycle("thermostate", [true, false]);

current_value = rxData.get();
console.log("RxDataStore =", current_value);

rxData.set({timer: 0});
//------------------------------------------------------------------------------
