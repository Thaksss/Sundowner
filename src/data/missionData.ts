export const systems = [
 {name:'Radiation',code:'RAD',base:74,unit:'mSv',value:156,description:'Cumulative exposure to ionizing radiation.',factors:['Galactic cosmic radiation','Time outside shielding','Solar particle events'],protocol:'Recommend monitoring dosimetry and reviewing shielding before an EVA.'},
 {name:'Musculoskeletal',code:'MSK',base:88,unit:'%',value:88,description:'A conceptual reserve for muscle and bone loading.',factors:['Reduced mechanical loading','Resistance exercise adherence','Mission duration'],protocol:'Recommend reviewing exercise adherence with the flight medical team.'},
 {name:'Sleep & cognitive',code:'COG',base:81,unit:'%',value:81,description:'A conceptual reserve for alertness and sleep recovery.',factors:['Sleep duration','Circadian disruption','Workload'],protocol:'Recommend monitoring sleep and repeating an alertness check.'},
 {name:'Cardiovascular',code:'CVS',base:92,unit:'%',value:92,description:'A conceptual reserve for cardiovascular conditioning.',factors:['Fluid redistribution','Aerobic conditioning','Hydration'],protocol:'Recommend reviewing hydration and exercise telemetry.'},
 {name:'Immune system',code:'IMM',base:86,unit:'%',value:86,description:'A conceptual reserve for immune resilience.',factors:['Mission stress','Sleep disruption','Environmental exposure'],protocol:'Recommend monitoring trends and consulting the flight medical team.'},
]
export const scenarios = ['Nominal','Solar flare','High CO₂','Headache'] as const
export type Scenario = typeof scenarios[number]
export const actions = [{name:'4 hour EVA',detail:'+12 mSv · −4% reserve',dose:12,reserve:-4},{name:'Skip resistance workout',detail:'−4% muscle reserve',dose:0,reserve:-4},{name:'Shelter protocol',detail:'Reduce modeled future exposure 80%',dose:0,reserve:2}]
