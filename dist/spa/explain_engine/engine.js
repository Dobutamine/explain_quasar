importScripts("./components/blood_compartment.js"),importScripts("./components/blood_connector.js"),importScripts("./components/valve.js"),importScripts("./components/gas_compartment.js"),importScripts("./components/gas_connector.js"),importScripts("./components/container.js"),importScripts("./components/diffusor.js"),importScripts("./components/exchanger.js"),importScripts("./components/ecg.js"),importScripts("./components/heart.js"),importScripts("./components/lungs.js"),importScripts("./components/breathing.js"),importScripts("./components/ans.js"),importScripts("./components/avinteraction.js"),importScripts("./components/brain.js"),importScripts("./components/drugs.js"),importScripts("./components/kidneys.js"),importScripts("./components/liver.js"),importScripts("./components/placenta.js"),importScripts("./components/uterus.js"),importScripts("./components/birth.js"),importScripts("./components/adaptation.js"),importScripts("./components/metabolism.js"),importScripts("./components/acidbase.js"),importScripts("./components/oxygenation.js"),importScripts("./components/blood.js"),importScripts("./components/gas.js"),importScripts("./devices/ecmo.js"),importScripts("./devices/cvvh.js"),importScripts("./devices/ventilator.js"),importScripts("./devices/monitor.js"),importScripts("./helpers/interventions.js"),importScripts("./helpers/datalogger.js"),importScripts("./helpers/math_functions.js");let main_timer,current_model={},model_definition={},interventions={},datalogger={},realtime_step=.03;onmessage=function(e){switch(e.data.type){case"get":"datalogger"===e.data.target&&(sendMessage("data",e.data.return_tag,null,datalogger[e.data.action](e.data.data)),sendMessage("mes",null,null,["ready"])),"model_definition"===e.data.target&&sendMessage("data",e.data.return_tag,null,model_definition);break;case"set_direct":current_model.components[e.data.target][e.data.action]=e.data.data,sendMessage("mes",null,null,[`${e.data.target}.${e.data.action} = ${e.data.data}`]);break;case"set":"datalogger"===e.data.target&&datalogger[e.data.action](e.data.data),"interventions"===e.data.target&&interventions[e.data.action](e.data.data),"ventilator"===e.data.target&&current_model.components["ventilator"][e.data.action](e.data.data),"change_property"===e.data.action&&(current_model.components[e.data.target]=e.data.data);break;case"cmd":switch(e.data.action){case"load":loadModel(e.data.data);break;case"start":startModel();break;case"stop":stopModel();break;case"calculate":null===e.data.data?calculateModel(10):calculateModel(e.data.data);break;case"goto":fastForwardModel(e.data.data);break;default:break}break;default:this.console.log("model received unknown command ",e.data.type,e.data.subtype,e.data.target,e.data.data);break}};const sendMessage=function(e,t,n,o,i){postMessage({type:e,target:t,action:n,data:o,return_tag:i})},initModel=function(e){e&&(current_model["weight"]=e["weight"],current_model["name"]=e["name"],current_model["description"]=e["description"],current_model["modeling_stepsize"]=e["modeling_stepsize"],current_model["model_time_total"]=0,current_model["components"]={},current_model["acidbase"]=calcAcidbaseFromTCO2,current_model["oxygenation"]=calcOxygenationFromTO2,initializeComponent("blood_compartment_definitions",BloodCompartment,!0),initializeComponent("blood_connector_definitions",BloodConnector,!0),initializeComponent("valve_definitions",Valve,!0),initializeComponent("gas_compartment_definitions",GasCompartment,!0),initializeComponent("gas_connector_definitions",GasConnector,!0),initializeComponent("container_definitions",Container,!0),initializeComponent("diffusor_definitions",Diffusor,!0),initializeComponent("exchanger_definitions",Exchanger,!0),initializeComponent("ecg",ECG),initializeComponent("metabolism",Metabolism),initializeComponent("heart",Heart),initializeComponent("lungs",Lungs),initializeComponent("breathing",Breathing),initializeComponent("ventilator",Ventilator),initializeComponent("ans",ANS),initializeComponent("avinteraction",AvInteraction),initializeComponent("brain",Brain),initializeComponent("drugs",Drugs),initializeComponent("kidneys",Kidneys),initializeComponent("liver",Liver),initializeComponent("placenta",Placenta),initializeComponent("uterus",Uterus),initializeComponent("birth",Birth),initializeComponent("ecmo",ECMO),initializeComponent("cvvh",CVVH),initializeComponent("adaptation",Adaptation),initializeComponent("monitor",Monitor),initializeComponent("blood",Blood),initializeComponent("gas",Gas),datalogger=new Datalogger(current_model),interventions=new Interventions(current_model),sendMessage("mes",null,null,["ready"]))},initializeComponent=function(e,t,n=!1){!1===n?(current_model.components[e]=new t(current_model),Object.keys(model_definition[e]).forEach((function(t){current_model.components[e][t]=model_definition[e][t]}))):model_definition[e].forEach((e=>{let n=new t(current_model);Object.keys(e).forEach((function(t){n[t]=e[t]})),current_model.components[n.name]=n}))},loadModel=function(e){current_model={},model_definition=e,sendMessage("mes",null,null,[`model engine loaded with '${e.name}' definition.`]),initModel(model_definition)},disposeModel=function(){main_timer&&(clearInterval(main_timer),clearTimeout(main_timer)),main_timer=null,current_model={},sendMessage("mes",null,null,["model disposed"]),sendMessage("mes",null,null,["ready"])},calculateModel=function(e){datalogger.realtime=!1;let t=parseInt(e/current_model.modeling_stepsize);sendMessage("mes",null,null,["calculating"]),sendMessage("mes",null,null,[`model clock at ${Math.round(current_model.model_time_total)} sec.`]),sendMessage("mes",null,null,[`calculating ${e} sec. in ${t} steps.`]);let n=0;if(model_definition){for(let o=0;o<t;o++)n+=modelStep();let e=n/t*1e3;sendMessage("mes",null,null,[`ready in ${n.toFixed(3)} sec.`]),sendMessage("mes",null,null,[`avg model step in ${e.toFixed(3)} ms.`])}datalogger.sendData(),stopModel()},fastForwardModel=function(e){let t=parseInt(e/current_model.modeling_stepsize);if(sendMessage("mes",null,null,["fast forwarding"]),sendMessage("mes",null,null,[`calculating ${e} sec. in ${t} steps.`]),model_definition){for(let e=0;e<t;e++)modelStepFastForward();sendMessage("mes",null,null,["fast forward ready"]),sendMessage("mes",null,null,[`model clock at ${Math.round(current_model.model_time_total)} sec.`])}sendMessage("mes",null,null,["ready"])},startModel=function(){model_definition&&(datalogger.realtime=!0,main_timer&&(clearInterval(main_timer),clearTimeout(main_timer)),main_timer=setInterval(modelStepRealtime,1e3*realtime_step),sendMessage("mes",null,null,["started"]))},stopModel=function(){model_definition&&(main_timer&&(clearInterval(main_timer),clearTimeout(main_timer)),main_timer=null,sendMessage("mes",null,null,[`stopped at ${Math.round(current_model.model_time_total)} seconds.`]),sendMessage("mes",null,null,["ready"]))},modelStep=function(){let e=performance.now();for(const t in current_model.components)current_model.components[t].modelStep();return interventions.modelStep(current_model.model_time_total),datalogger.modelStep(current_model.model_time_total,interventions.getAnnotations()),datalogger.annotations_processed&&(datalogger.annotations_processed=!1,interventions.clearAnnotations()),current_model.model_time_total+=current_model.modeling_stepsize,(performance.now()-e)/1e3},modelStepRealtime=function(){let e=performance.now(),t=parseInt(realtime_step/current_model.modeling_stepsize);for(let n=0;n<t;n++){for(const e in current_model.components)current_model.components[e].modelStep();interventions.modelStep(current_model.model_time_total),datalogger.modelStepRealtime(current_model.model_time_total,interventions.getAnnotations()),datalogger.annotations_processed&&(datalogger.annotations_processed=!1,interventions.clearAnnotations()),current_model.model_time_total+=current_model.modeling_stepsize}return(performance.now()-e)/1e3},modelStepFastForward=function(){for(const e in current_model.components)current_model.components[e].modelStep();current_model.model_time_total+=current_model.modeling_stepsize};