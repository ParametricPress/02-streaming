export function display_size_data(){
 // Check for support of the PerformanceResourceTiming.*size properties and print their values
  // if supported.
  var sum = 0;
  if (performance === undefined) {
    console.log("= Display Size Data: performance NOT supported");
    return;
  }

  var list = performance.getEntriesByType("resource");
  if (list === undefined) {
    console.log("= Display Size Data: performance.getEntriesByType() is  NOT supported");
    return;
  }

  // For each "resource", display its *Size property values
  console.log("= Display Size Data");
  for (var i=0; i < list.length; i++) {
    if ("transferSize" in list[i]){
      sum += list[i].transferSize;
    }
    else
      console.log("... transferSize[" + i + "] = NOT supported");
  }
  console.log(sum);
  return sum;
}

export function clear_resource_timings() {
  if (performance === undefined) {
    console.log("= performance.clearResourceTimings(): peformance NOT supported");
    return;
  }
  // Check if Performance.clearResourceTiming() is supported 
  console.log ("= Print performance.clearResourceTimings()");
  var supported = typeof performance.clearResourceTimings == "function";
  if (supported) {
    console.log("… Performance.clearResourceTimings() = supported");
    performance.clearResourceTimings();
  } else {
    console.log("… Performance.clearResourceTiming() = NOT supported");
    return;
  }
  // getEntries should now return zero
  var p = performance.getEntriesByType("resource");
  if (p.length == 0)  
    console.log("… Performance data buffer cleared");
  else
    console.log("… Performance data buffer NOT cleared (still have `" + p.length + "` items");
}
