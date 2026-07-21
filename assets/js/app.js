/* ==========================================
   VASU AI PRO
   app.js
   Part 1
========================================== */

'use strict';

/* ==========================================
   APP CONFIG
========================================== */

const APP = {

    name: "VASU AI PRO",

    version: "1.0.0",

    author: "VASU ENTERPRISE",

    domain: "https://aihubpro.in",

    country: "India",

    state: "Haryana",

    city: "Yamunanagar"

};

/* ==========================================
   DOM READY
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    console.log(APP.name + " Loaded");

    initApp();

});

/* ==========================================
   INIT
========================================== */

function initApp(){

    initializeTheme();

    initializeNavigation();

    initializeButtons();

    initializeLoader();

    initializeBackToTop();

    initializeTooltips();

    initializeSearch();

}

/* ==========================================
   LOADER
========================================== */

function initializeLoader(){

    const loader=document.querySelector(".page-loader");

    if(!loader) return;

    window.addEventListener("load",()=>{

        loader.style.opacity="0";

        setTimeout(()=>{

            loader.remove();

        },500);

    });

}

/* ==========================================
   THEME
========================================== */

function initializeTheme(){

    const theme=localStorage.getItem("theme");

    if(theme==="light"){

        document.body.classList.add("light");

    }

}

/* ==========================================
   CHANGE THEME
========================================== */

function toggleTheme(){

    document.body.classList.toggle("light");

    if(document.body.classList.contains("light")){

        localStorage.setItem("theme","light");

    }else{

        localStorage.setItem("theme","dark");

    }

}

/* ==========================================
   BUTTON EVENTS
========================================== */

function initializeButtons(){

    const btn=document.querySelector(".theme-toggle");

    if(btn){

        btn.addEventListener("click",toggleTheme);

    }

}

/* ==========================================
   NAVIGATION
========================================== */

function initializeNavigation(){

    const menu=document.querySelector(".mobile-menu");

    const nav=document.querySelector(".nav-links");

    if(menu && nav){

        menu.onclick=()=>{

            nav.classList.toggle("active");

        }

    }

}

/* ==========================================
   SEARCH
========================================== */

function initializeSearch(){

    const input=document.querySelector(".search-input");

    if(!input) return;

    input.addEventListener("keyup",function(){

        console.log(this.value);

    });

}

/* ==========================================
   TOOLTIPS
========================================== */

function initializeTooltips(){

    document.querySelectorAll("[data-tooltip]").forEach(item=>{

        item.addEventListener("mouseenter",()=>{

        });

    });

}

/* ==========================================
   BACK TO TOP
========================================== */

function initializeBackToTop(){

    const btn=document.querySelector(".back-to-top");

    if(!btn) return;

    window.addEventListener("scroll",()=>{

        if(window.scrollY>400){

            btn.style.display="flex";

        }else{

            btn.style.display="none";

        }

    });

    btn.onclick=()=>{

        window.scrollTo({

            top:0,

            behavior:"smooth"

        });

    };

}

/* ==========================================
   VASU AI PRO
   APP.JS
   PART 2
========================================== */

/* ==========================================
   TOAST NOTIFICATION SYSTEM
========================================== */

function showToast(message, type = "info", duration = 4000) {

    const oldToast = document.querySelector(".toast");

    if (oldToast) {
        oldToast.remove();
    }

    const toast = document.createElement("div");

    toast.className = "toast toast-" + type;

    let icon = "ℹ️";

    switch(type){

        case "success":
            icon = "✅";
            break;

        case "error":
            icon = "❌";
            break;

        case "warning":
            icon = "⚠️";
            break;

        case "info":
            icon = "ℹ️";
            break;

    }

    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>

        <div class="toast-message">

            ${message}

        </div>

        <button class="toast-close">

            ✖

        </button>
    `;

    document.body.appendChild(toast);

    const closeButton = toast.querySelector(".toast-close");

    closeButton.onclick = () => {

        hideToast(toast);

    };

    setTimeout(() => {

        hideToast(toast);

    }, duration);

}

/* ==========================================
   HIDE TOAST
========================================== */

function hideToast(toast){

    if(!toast) return;

    toast.style.opacity = "0";

    toast.style.transform = "translateX(120px)";

    setTimeout(() => {

        toast.remove();

    },300);

}

/* ==========================================
   COMMON NOTIFICATION FUNCTIONS
========================================== */

function success(message){

    showToast(message,"success");

}

function error(message){

    showToast(message,"error");

}

function warning(message){

    showToast(message,"warning");

}

function info(message){

    showToast(message,"info");

}

/* ==========================================
   INTERNET STATUS
========================================== */

window.addEventListener("online",()=>{

    success("Internet Connected");

});

window.addEventListener("offline",()=>{

    warning("Internet Disconnected");

});

/* ==========================================
   COPY TO CLIPBOARD
========================================== */

async function copyText(text){

    try{

        await navigator.clipboard.writeText(text);

        success("Copied Successfully");

    }

    catch(e){

        error("Copy Failed");

    }

}

/* ==========================================
   LOADING BUTTON
========================================== */

function loadingButton(button){

    if(!button) return;

    button.dataset.original = button.innerHTML;

    button.disabled = true;

    button.innerHTML =

    "⏳ Please Wait...";

}

function resetButton(button){

    if(!button) return;

    button.disabled = false;

    button.innerHTML =

    button.dataset.original;

}

/* ==========================================
   VASU AI PRO
   app.js
   PART 3
========================================== */

/* ==========================================
   MODAL MANAGER
========================================== */

const Modal={

    element:null,

    content:null

};

/* ==========================================
   INIT MODAL
========================================== */

function initializeModal(){

    Modal.element=document.getElementById("appModal");

    if(!Modal.element) return;

    Modal.content=Modal.element.querySelector(".modal-content");

    Modal.element.addEventListener("click",function(e){

        if(e.target===Modal.element){

            closeModal();

        }

    });

    document.addEventListener("keydown",function(e){

        if(e.key==="Escape"){

            closeModal();

        }

    });

}

/* ==========================================
   OPEN MODAL
========================================== */

function openModal(title,html){

    if(!Modal.element) return;

    Modal.content.innerHTML=`

        <div class="modal-header">

            <h2>${title}</h2>

            <button class="modal-close" onclick="closeModal()">✖</button>

        </div>

        <div class="modal-body">

            ${html}

        </div>

    `;

    Modal.element.style.display="flex";

    document.body.style.overflow="hidden";

}

/* ==========================================
   CLOSE MODAL
========================================== */

function closeModal(){

    if(!Modal.element) return;

    Modal.element.style.display="none";

    document.body.style.overflow="";

}

/* ==========================================
   ALERT
========================================== */

function showAlert(message){

    openModal(

        "Notification",

        `

        <p>${message}</p>

        <br>

        <button class="btn btn-primary"

        onclick="closeModal()">

        OK

        </button>

        `

    );

}

/* ==========================================
   CONFIRM
========================================== */

function showConfirm(message,callback){

    openModal(

        "Confirmation",

        `

        <p>${message}</p>

        <br>

        <div style="display:flex;gap:10px;">

            <button

            class="btn btn-primary"

            id="confirmYes">

            Yes

            </button>

            <button

            class="btn btn-danger"

            onclick="closeModal()">

            No

            </button>

        </div>

        `

    );

    setTimeout(()=>{

        const yes=document.getElementById("confirmYes");

        if(yes){

            yes.onclick=function(){

                closeModal();

                callback();

            };

        }

    },100);

}

/* ==========================================
   LOADING MODAL
========================================== */

function showLoading(text="Loading..."){

    openModal(

        "Please Wait",

        `

        <div style="text-align:center;padding:30px;">

            <div class="loader-circle"></div>

            <br>

            <h3>${text}</h3>

        </div>

        `

    );

}

/* ==========================================
   SUCCESS MODAL
========================================== */

function showSuccess(text){

    openModal(

        "Success",

        `

        <div style="text-align:center;">

            <h1>✅</h1>

            <h3>${text}</h3>

        </div>

        `

    );

}

/* ==========================================
   ERROR MODAL
========================================== */

function showError(text){

    openModal(

        "Error",

        `

        <div style="text-align:center;">

            <h1>❌</h1>

            <h3>${text}</h3>

        </div>

        `

    );

}

/* ==========================================
   UPDATE INIT
========================================== */

const oldInit=initApp;

initApp=function(){

    oldInit();

    initializeModal();

};
/* ==========================================
   VASU AI PRO
   APP.JS
   PART 4
   MULTI LANGUAGE ENGINE
========================================== */

/* ==========================================
   LANGUAGE DATA
========================================== */

const LANG = {

    en: {

        home: "Home",
        tools: "Tools",
        pricing: "Pricing",
        login: "Login",
        signup: "Sign Up",
        search: "Search Tools...",
        welcome: "Welcome to VASU AI PRO",
        freeTrial: "5 Minutes Free Trial",
        buyNow: "Upgrade Now",
        contact: "Contact"

    },

    hi: {

        home: "होम",
        tools: "टूल्स",
        pricing: "प्लान",
        login: "लॉगिन",
        signup: "साइन अप",
        search: "टूल खोजें...",
        welcome: "VASU AI PRO में आपका स्वागत है",
        freeTrial: "5 मिनट मुफ्त ट्रायल",
        buyNow: "अभी अपग्रेड करें",
        contact: "संपर्क"

    },

    hinglish: {

        home: "Home",
        tools: "Tools",
        pricing: "Plan",
        login: "Login",
        signup: "Sign Up",
        search: "Tool Search Karo...",
        welcome: "VASU AI PRO me Welcome",
        freeTrial: "5 Minute Free Trial",
        buyNow: "Abhi Upgrade Karo",
        contact: "Contact"

    }

};

/* ==========================================
   CURRENT LANGUAGE
========================================== */

let currentLanguage =
localStorage.getItem("language") || "en";

/* ==========================================
   CHANGE LANGUAGE
========================================== */

function changeLanguage(lang){

    if(!LANG[lang]) return;

    currentLanguage = lang;

    localStorage.setItem("language",lang);

    updateLanguage();

}

/* ==========================================
   UPDATE TEXT
========================================== */

function updateLanguage(){

    document.querySelectorAll("[data-lang]")

    .forEach(item=>{

        const key=item.dataset.lang;

        if(LANG[currentLanguage][key]){

            item.innerHTML=
            LANG[currentLanguage][key];

        }

    });

}

/* ==========================================
   AUTO DETECT
========================================== */

function detectLanguage(){

    const browser=
    navigator.language.toLowerCase();

    if(browser.startsWith("hi")){

        currentLanguage="hi";

    }

    else{

        currentLanguage="en";

    }

    if(localStorage.getItem("language")){

        currentLanguage=
        localStorage.getItem("language");

    }

    updateLanguage();

}

/* ==========================================
   LANGUAGE BUTTONS
========================================== */

function initializeLanguageButtons(){

    document

    .querySelectorAll("[data-change-language]")

    .forEach(btn=>{

        btn.onclick=function(){

            changeLanguage(

                this.dataset.changeLanguage

            );

        };

    });

}

/* ==========================================
   LANGUAGE SELECT
========================================== */

function initializeLanguageSelector(){

    const select=

    document.getElementById("languageSelect");

    if(!select) return;

    select.value=currentLanguage;

    select.onchange=function(){

        changeLanguage(this.value);

    };

}

/* ==========================================
   INIT
========================================== */

const previousInit=initApp;

initApp=function(){

    previousInit();

    detectLanguage();

    initializeLanguageButtons();

    initializeLanguageSelector();

};

/* ==========================================
   GET CURRENT LANGUAGE
========================================== */

function getCurrentLanguage(){

    return currentLanguage;

}

/* ==========================================
   VASU AI PRO
   APP.JS
   PART 5
   AI CHAT ENGINE
========================================== */

/* ==========================================
   CHAT CONFIG
========================================== */

const CHAT = {

    api: "/chat",

    history: [],

    sending: false,

    maxHistory: 50

};

/* ==========================================
   INIT CHAT
========================================== */

function initializeChat(){

    const input=document.getElementById("chatInput");

    const button=document.getElementById("sendButton");

    if(input){

        input.addEventListener("keypress",function(e){

            if(e.key==="Enter" && !e.shiftKey){

                e.preventDefault();

                sendMessage();

            }

        });

    }

    if(button){

        button.onclick=sendMessage;

    }

}

/* ==========================================
   SEND MESSAGE
========================================== */

async function sendMessage(){

    if(CHAT.sending) return;

    const input=document.getElementById("chatInput");

    if(!input) return;

    const message=input.value.trim();

    if(message==="") return;

    CHAT.sending=true;

    addMessage("user",message);

    input.value="";

    showTyping();

    try{

        const response=await fetch(CHAT.api,{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                message:message,

                lang:getCurrentLanguage()

            })

        });

        const data=await response.json();

        removeTyping();

        if(data.reply){

            addMessage("ai",data.reply);

        }

        else if(data.error){

            addMessage("ai","❌ "+data.error);

        }

        else{

            addMessage("ai","⚠️ Unexpected response.");

        }

    }

    catch(error){

        removeTyping();

        addMessage(

            "ai",

            "❌ Unable to connect server."

        );

    }

    CHAT.sending=false;

}

/* ==========================================
   ADD MESSAGE
========================================== */

function addMessage(type,text){

    const box=document.getElementById("chatMessages");

    if(!box) return;

    const div=document.createElement("div");

    div.className="chat-message "+type;

    div.innerHTML=`

        <div class="chat-bubble">

            ${escapeHtml(text)}

        </div>

    `;

    box.appendChild(div);

    box.scrollTop=box.scrollHeight;

    CHAT.history.push({

        role:type,

        text:text,

        time:new Date()

    });

    if(CHAT.history.length>

    CHAT.maxHistory){

        CHAT.history.shift();

    }

}

/* ==========================================
   TYPING
========================================== */

function showTyping(){

    const box=document.getElementById("chatMessages");

    if(!box) return;

    const div=document.createElement("div");

    div.id="typingIndicator";

    div.className="chat-message ai";

    div.innerHTML=`

        <div class="chat-bubble">

            ⏳ AI is typing...

        </div>

    `;

    box.appendChild(div);

    box.scrollTop=box.scrollHeight;

}

function removeTyping(){

    const typing=document.getElementById("typingIndicator");

    if(typing){

        typing.remove();

    }

}

/* ==========================================
   ESCAPE HTML
========================================== */

function escapeHtml(text){

    const div=document.createElement("div");

    div.innerText=text;

    return div.innerHTML;

}

/* ==========================================
   CLEAR CHAT
========================================== */

function clearChat(){

    CHAT.history=[];

    const box=document.getElementById("chatMessages");

    if(box){

        box.innerHTML="";

    }

}

/* ==========================================
   INIT UPDATE
========================================== */

const initChatOld=initApp;

initApp=function(){

    initChatOld();

    initializeChat();

};

/* ==========================================
   VASU AI PRO
   APP.JS
   PART 6
   TRIAL & SUBSCRIPTION
========================================== */

const SUBSCRIPTION = {

    trialMinutes:5,

    lockHours:24,

    basicPlan:666,

    proPlan:999,

    timer:null

};

/* ==========================================
   START TRIAL
========================================== */

function startTrial(){

    if(localStorage.getItem("trialStart")) return;

    localStorage.setItem(

        "trialStart",

        Date.now()

    );

}

/* ==========================================
   CHECK TRIAL
========================================== */

function checkTrial(){

    const start=

    localStorage.getItem("trialStart");

    if(!start){

        startTrial();

        return true;

    }

    const elapsed=

    Date.now()-Number(start);

    const limit=

    SUBSCRIPTION.trialMinutes

    *60*1000;

    if(elapsed<limit){

        return true;

    }

    lockTrial();

    return false;

}

/* ==========================================
   LOCK USER
========================================== */

function lockTrial(){

    const unlock=

    Date.now()+

    (SUBSCRIPTION.lockHours

    *60*60*1000);

    localStorage.setItem(

        "trialLock",

        unlock

    );

    showSubscription();

}

/* ==========================================
   CHECK LOCK
========================================== */

function isLocked(){

    const lock=

    localStorage.getItem(

        "trialLock"

    );

    if(!lock) return false;

    if(Date.now()>Number(lock)){

        localStorage.removeItem(

            "trialLock"

        );

        localStorage.removeItem(

            "trialStart"

        );

        return false;

    }

    return true;

}

/* ==========================================
   TIMER
========================================== */

function startTimer(){

    clearInterval(

        SUBSCRIPTION.timer

    );

    SUBSCRIPTION.timer=

    setInterval(()=>{

        const start=

        Number(

        localStorage.getItem(

        "trialStart"

        ));

        if(!start) return;

        const remain=

        (SUBSCRIPTION.trialMinutes

        *60)

        -

        Math.floor(

        (Date.now()-start)/1000

        );

        const timer=

        document.getElementById(

        "trialTimer"

        );

        if(timer){

            if(remain>0){

                const m=

                Math.floor(remain/60);

                const s=

                remain%60;

                timer.innerHTML=

                `${m}:${

                s.toString()

                .padStart(2,"0")

                }`;

            }else{

                timer.innerHTML=

                "Expired";

            }

        }

    },1000);

}

/* ==========================================
   SUBSCRIPTION POPUP
========================================== */

function showSubscription(){

    openModal(

    "Upgrade VASU AI PRO",

    `

    <div class="pricing-popup">

        <h2>

        🎉 Free Trial Finished

        </h2>

        <p>

        Unlimited AI aur Premium Tools

        unlock karne ke liye plan choose kare.

        </p>

        <br>

        <div class="pricing-card">

            <h3>

            ₹666 Basic

            </h3>

            <p>

            ✔ Ads Supported

            </p>

            <p>

            ✔ Unlimited Chat

            </p>

            <button

            class="btn btn-primary"

            onclick="buyPlan('basic')">

            Buy ₹666

            </button>

        </div>

        <br>

        <div class="pricing-card">

            <h3>

            ₹999 PRO

            </h3>

            <p>

            ✔ No Ads

            </p>

            <p>

            ✔ Fast AI

            </p>

            <p>

            ✔ Premium Features

            </p>

            <button

            class="btn btn-success"

            onclick="buyPlan('pro')">

            Buy ₹999

            </button>

        </div>

    </div>

    `

    );

}

/* ==========================================
   BUY PLAN
========================================== */

function buyPlan(plan){

    if(plan==="basic"){

        window.location.href=

        "/payment?plan=666";

    }

    else{

        window.location.href=

        "/payment?plan=999";

    }

}

/* ==========================================
   INIT
========================================== */

const subscriptionInit=

initApp;

initApp=function(){

    subscriptionInit();

    if(isLocked()){

        showSubscription();

    }

    else{

        checkTrial();

        startTimer();

    }

};
/* ==========================================
   VASU AI PRO
   app.js
   PART 7
   PAYMENT MANAGER
========================================== */

const PAYMENT = {

    currency: "INR",

    basicAmount: 666,

    proAmount: 999,

    basicPlan: "VASU AI PRO BASIC",

    proPlan: "VASU AI PRO PRO"

};

/* ==========================================
   SELECT PLAN
========================================== */

function buyPlan(plan){

    if(plan==="basic"){

        startPayment({

            plan:"basic",

            amount:PAYMENT.basicAmount

        });

    }

    else if(plan==="pro"){

        startPayment({

            plan:"pro",

            amount:PAYMENT.proAmount

        });

    }

}

/* ==========================================
   START PAYMENT
========================================== */

async function startPayment(data){

    loadingButton(

        document.activeElement

    );

    try{

        const response=await fetch(

            "/api/create-order",

            {

                method:"POST",

                headers:{

                    "Content-Type":

                    "application/json"

                },

                body:JSON.stringify(data)

            }

        );

        const order=

        await response.json();

        if(order.success){

            openRazorpay(order);

        }

        else{

            error(

            order.message ||

            "Payment Failed"

            );

        }

    }

    catch(e){

        error(

        "Unable to connect payment server."

        );

    }

}

/* ==========================================
   OPEN RAZORPAY
========================================== */

function openRazorpay(order){

    if(typeof Razorpay==="undefined"){

        error(

        "Razorpay SDK Missing"

        );

        return;

    }

    const options={

        key:order.key,

        amount:order.amount,

        currency:order.currency,

        name:"VASU AI PRO",

        description:order.plan,

        order_id:order.orderId,

        handler:function(response){

            verifyPayment(response);

        },

        theme:{

            color:"#2563eb"

        }

    };

    const razor=

    new Razorpay(options);

    razor.open();

}

/* ==========================================
   VERIFY PAYMENT
========================================== */

async function verifyPayment(payment){

    showLoading(

    "Verifying Payment..."

    );

    try{

        const res=

        await fetch(

        "/api/verify-payment",

        {

            method:"POST",

            headers:{

                "Content-Type":

                "application/json"

            },

            body:JSON.stringify(payment)

        });

        const data=

        await res.json();

        closeModal();

        if(data.success){

            paymentSuccess(data);

        }

        else{

            paymentFailed();

        }

    }

    catch(e){

        closeModal();

        paymentFailed();

    }

}

/* ==========================================
   PAYMENT SUCCESS
========================================== */

function paymentSuccess(data){

    success(

    "Payment Successful 🎉"

    );

    localStorage.setItem(

        "subscription",

        data.plan

    );

    showSuccess(

    "Welcome to Premium."

    );

}

/* ==========================================
   PAYMENT FAILED
========================================== */

function paymentFailed(){

    error(

    "Payment Failed."

    );

    showError(

    "Transaction Cancelled."

    );

}

/* ==========================================
   CHECK PREMIUM
========================================== */

function isPremium(){

    return localStorage

    .getItem("subscription")

    !==null;

}

/* ==========================================
   VASU AI PRO
   app.js
   PART 8
   USER AUTHENTICATION
========================================== */

"use strict";

/* ==========================================
   USER OBJECT
========================================== */

const USER = {

    loggedIn: false,

    premium: false,

    email: "",

    name: "",

    token: ""

};

/* ==========================================
   INIT USER
========================================== */

function initializeUser(){

    const token = localStorage.getItem("vasu_token");

    if(token){

        USER.loggedIn = true;

        USER.token = token;

    }

    const email = localStorage.getItem("vasu_email");

    if(email){

        USER.email = email;

    }

}

/* ==========================================
   LOGIN
========================================== */

async function login(email,password){

    try{

        const response = await fetch("/api/login",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                email,

                password

            })

        });

        const data = await response.json();

        if(data.success){

            USER.loggedIn = true;

            USER.email = email;

            USER.token = data.token;

            localStorage.setItem("vasu_token",data.token);

            localStorage.setItem("vasu_email",email);

            success("Login Successful");

        }

        else{

            error(data.message || "Login Failed");

        }

    }

    catch(e){

        error("Unable to connect server.");

    }

}

/* ==========================================
   REGISTER
========================================== */

async function register(name,email,password){

    try{

        const response = await fetch("/api/register",{

            method:"POST",

            headers:{

                "Content-Type":"application/json"

            },

            body:JSON.stringify({

                name,

                email,

                password

            })

        });

        const data = await response.json();

        if(data.success){

            success("Registration Successful");

        }

        else{

            error(data.message);

        }

    }

    catch(e){

        error("Registration Failed");

    }

}

/* ==========================================
   LOGOUT
========================================== */

function logout(){

    USER.loggedIn=false;

    USER.premium=false;

    USER.email="";

    USER.token="";

    localStorage.removeItem("vasu_token");

    localStorage.removeItem("vasu_email");

    success("Logged Out");

}

/* ==========================================
   CHECK LOGIN
========================================== */

function isLoggedIn(){

    return USER.loggedIn;

}

/* ==========================================
   REQUIRE LOGIN
========================================== */

function requireLogin(){

    if(!isLoggedIn()){

        showAlert(

        "Please Login First."

        );

        return false;

    }

    return true;

}

/* ==========================================
   PROFILE
========================================== */

async function loadProfile(){

    if(!USER.token) return;

    try{

        const response = await fetch("/api/profile",{

            headers:{

                Authorization:

                "Bearer "+USER.token

            }

        });

        const data = await response.json();

        if(data.success){

            USER.name=data.user.name;

            USER.premium=data.user.premium;

        }

    }

    catch(e){

        console.log(e);

    }

}

/* ==========================================
   AUTO LOGIN
========================================== */

const authInit=initApp;

initApp=function(){

    authInit();

    initializeUser();

    loadProfile();

};

/* ==========================================
   VASU AI PRO
   app.js
   PART 9
   API MANAGER
========================================== */

"use strict";

/* ==========================================
   API CONFIG
========================================== */

const API={

    base:"/api",

    timeout:30000,

    retry:2,

    headers:{

        "Content-Type":"application/json"

    }

};

/* ==========================================
   API REQUEST
========================================== */

async function apiRequest(

endpoint,

method="GET",

data=null

){

    let retry=0;

    while(retry<=API.retry){

        try{

            const controller=

            new AbortController();

            const timer=

            setTimeout(()=>{

                controller.abort();

            },API.timeout);

            const options={

                method,

                headers:API.headers,

                signal:controller.signal

            };

            if(data){

                options.body=

                JSON.stringify(data);

            }

            const response=

            await fetch(

                API.base+endpoint,

                options

            );

            clearTimeout(timer);

            if(!response.ok){

                throw new Error(

                    response.status

                );

            }

            return await response.json();

        }

        catch(error){

            retry++;

            if(retry>API.retry){

                throw error;

            }

        }

    }

}

/* ==========================================
   GET
========================================== */

async function apiGet(url){

    return await apiRequest(

        url,

        "GET"

    );

}

/* ==========================================
   POST
========================================== */

async function apiPost(

url,

data

){

    return await apiRequest(

        url,

        "POST",

        data

    );

}

/* ==========================================
   PUT
========================================== */

async function apiPut(

url,

data

){

    return await apiRequest(

        url,

        "PUT",

        data

    );

}

/* ==========================================
   DELETE
========================================== */

async function apiDelete(url){

    return await apiRequest(

        url,

        "DELETE"

    );

}

/* ==========================================
   INTERNET STATUS
========================================== */

window.addEventListener(

"online",

()=>{

    success(

    "Internet Connected"

    );

}

);

window.addEventListener(

"offline",

()=>{

    warning(

    "Internet Disconnected"

    );

}

);

/* ==========================================
   SERVER HEALTH
========================================== */

async function checkServer(){

    try{

        await apiGet("/health");

        console.log(

        "Server Online"

        );

    }

    catch{

        console.log(

        "Server Offline"

        );

    }

}

/* ==========================================
   AUTO HEALTH CHECK
========================================== */

setInterval(

checkServer,

60000

);

/* ==========================================
   REQUEST QUEUE
========================================== */

const requestQueue=[];

function addQueue(task){

    requestQueue.push(task);

}

async function processQueue(){

    while(requestQueue.length){

        const task=

        requestQueue.shift();

        await task();

    }

}
/* ==========================================
   VASU AI PRO
   APP.JS
   PART 10
   CORE FRAMEWORK
========================================== */

"use strict";

/* ==========================================
   APP VERSION
========================================== */

const SYSTEM = {

    version: "1.0.0",

    build: "2026.01",

    developer: "VASU ENTERPRISE",

    updateCheck: true

};

/* ==========================================
   PERFORMANCE
========================================== */

function optimizePerformance(){

    if("requestIdleCallback" in window){

        requestIdleCallback(()=>{

            console.log("Performance Optimized");

        });

    }

}

/* ==========================================
   LOCAL CACHE
========================================== */

const CACHE={

    save(key,value){

        localStorage.setItem(

            key,

            JSON.stringify(value)

        );

    },

    get(key){

        const data=

        localStorage.getItem(key);

        if(!data) return null;

        return JSON.parse(data);

    },

    remove(key){

        localStorage.removeItem(key);

    }

};

/* ==========================================
   XSS SAFE TEXT
========================================== */

function sanitize(text){

    return text

    .replace(/</g,"&lt;")

    .replace(/>/g,"&gt;")

    .replace(/"/g,"&quot;")

    .replace(/'/g,"&#39;");

}

/* ==========================================
   GLOBAL ERROR
========================================== */

window.onerror=function(

message,

file,

line

){

    console.error(

        message,

        file,

        line

    );

};

/* ==========================================
   PROMISE ERROR
========================================== */

window.addEventListener(

"unhandledrejection",

function(event){

    console.error(

    event.reason

    );

});



/* ==========================================
   AUTO UPDATE CHECK
========================================== */

async function checkUpdate(){

    try{

        const data=

        await apiGet("/version");

        if(data.version!==SYSTEM.version){

            info(

            "New Update Available"

            );

        }

    }

    catch(e){

    }

}

/* ==========================================
   PWA
========================================== */

async function registerServiceWorker(){

    if(

    "serviceWorker"

    in navigator

    ){

        try{

            await navigator

            .serviceWorker

            .register(

            "/sw.js"

            );

            console.log(

            "Service Worker Ready"

            );

        }

        catch(e){

            console.log(e);

        }

    }

}

/* ==========================================
   DEVICE
========================================== */

function deviceType(){

    return window.innerWidth<768

    ?"mobile":"desktop";

}

/* ==========================================
   BOOTSTRAP
========================================== */

const finalInit=initApp;

initApp=function(){

    finalInit();

    optimizePerformance();

    registerServiceWorker();

    checkUpdate();

    console.log(

        "VASU AI PRO Ready"

    );

};




