import HeadElement from "../components/lt-head.js";
import SessionElement from "../components/lt-session.js";
import ThemeToggleElement from "../components/lt-theme-toggle.js";

import config from "./config.js";

const urlSearchParams = new URLSearchParams(window.location.search);

let id = urlSearchParams.get("id");
id = id ? id : config.defaultId;

let lastUpdate = 0;
let datahistory;

polster();

async function polster() {
   setTimeout(polster, config.updatePeriod);

   let response = await fetch(config.dataUrl + id);
   let data = await response.json();

   let head = data.head;
   let time = head.datet;

   if (time > lastUpdate) {
      lastUpdate = time;
      document.querySelector("#background").style["background-image"] = "url(" + head.calendar_event_track + ")";

      let headElement = document.querySelector("lt-head");

      Object.entries(head).forEach(([key, value]) => {
         headElement.setAttribute(key, value)
      });

      let session = document.querySelector("lt-session");

      computehistory(data);

      session.data = data;
   
      let themeToggleElement = document.querySelector("lt-theme-toggle");
      themeToggleElement.addEventListener("theme", (ev) => {
         let clazz = ev.detail;
         let removeClass = clazz == "dark" ? "light" : "dark";
         let classList = document.querySelector("body").classList;
         classList.remove(removeClass);
         classList.add(clazz);
      });
   }
}

async function computehistory(data)
{      
      Object.entries(data.rider).forEach(([keydata, valuedata]) => {
         valuedata.history = [];

         if (datahistory != undefined)
         {
            Object.entries(datahistory.rider).forEach(([keyhistory, valuehistory]) => {
               if (valuedata.rider_id == valuehistory.rider_id)
               {
                  valuedata.history = valuehistory.history;
               }
            });
         }

         let exist = false;

         valuedata.formathistory  = "";
         Object.entries(valuedata.history).forEach(([keyhistory, valuehistory]) => {
            if (valuehistory.num_lap == valuedata.last_lap)
            {
               exist = true;
            }
            valuedata.formathistory += valuehistory.num_lap + " : " + valuehistory.lap_time + " <br>";
         });

         if (!exist)         
         {
            valuedata.history.push({"num_lap":valuedata.last_lap,"lap_time":valuedata.last_lap_time});
            valuedata.formathistory += valuedata.last_lap + " : " + valuedata.last_lap_time + " <br>";
         }

      });

      datahistory = data;
}
