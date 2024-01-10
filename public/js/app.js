let subtotaltext = document.getElementById("subtotaltext")
let subtotal = 0
let taxtext = document.getElementById("taxtext")
let tax = 0
let totaltext = document.getElementById("totaltext")
let total = 0
let totalDb = 0
let memToSave = "monthly"
const month = 75
const year = 900
const costMin = 0.58


const changeDropValue = () => {
    
    let membership = document.getElementById("membership-select")
    let mem = membership.options[membership.selectedIndex].value
    
    if (mem === "monthly"){
        subtotaltext.innerText = `$ ${month.toFixed(2)}`
        const temptax = month * 0.13
        taxtext.innerText = `$ ${temptax.toFixed(2)}`
        const temptotal = month + temptax
        totalDb = temptotal.toFixed(2)
        totaltext.innerText = `$ ${temptotal.toFixed(2)}`
        memToSave = "monthly"
    } else {
        subtotaltext.innerText = `$ ${year.toFixed(2)}`
        const temptax = year * 0.13
        taxtext.innerText = `$ ${temptax.toFixed(2)}`
        const temptotal = year + temptax
        totalDb = temptotal.toFixed(2)
        totaltext.innerText = `$ ${temptotal.toFixed(2)}`
        memToSave = "yearly"
    }
}
//call function when purchase page is loaded
const purchaseLoad = () => {
    
    if(document.getElementById("option_one") !== null){
        document.getElementById("option_one").addEventListener("click", showDropDown)
        document.getElementById("option_two").addEventListener("click", hideDropDown)
        document.getElementById("membership-select").style.display = "none"

        document.getElementById("membership-select").addEventListener("change", changeDropValue)
        
        fetchRequest = fetch("/class", {method: "GET", headers: {'Content-Type' : 'application/json'}})
    
        fetchRequest.then(response => {
            return (response.ok) ? response.json() : Promise.reject("Unable to get data")
        })
        .then(responseJSONData => {
        

            for(let i = 0; i<responseJSONData.length; i++){
                subtotal = subtotal + responseJSONData[i].duration * costMin
            }
            subtotaltext.innerText = `$ ${subtotal.toFixed(2)}`
            tax = subtotal * 0.13
            taxtext.innerText = `$ ${tax.toFixed(2)}`
            total = subtotal + tax
            totalDb = total.toFixed(2)
            totaltext.innerText = `$ ${total.toFixed(2)}`
            
        })
        .catch(err => {
            console.log(`Error :  ${err}`)
        })
    }
}


const showDropDown = () => {
    document.getElementById("membership-select").style.display = "block"
    changeDropValue()
}
const hideDropDown = () => {
    document.getElementById("membership-select").style.display = "none"
    subtotaltext.innerText = `$ ${subtotal.toFixed(2)}`
    taxtext.innerText = `$ ${tax.toFixed(2)}`
    totalDb = total.toFixed(2)
    totaltext.innerText = `$ ${total.toFixed(2)}`
    memToSave = "no"
}

const makeAPIRequest = (url, method, data) => {
    let fetchRequest


    fetchRequest = fetch(url, {method: method, body: JSON.stringify(data), headers: {'Content-Type' : 'application/json'}})
    
    fetchRequest.then(response => {
        return (response.ok) ? response.json() : Promise.reject("Unable to save data")
    })
    .then(responseJSONData => {
        console.log(`Response from API ${responseJSONData.message}`)
    })
    .catch(err => {
        console.log(`Error :  ${err}`)
    })
}

const saveCheckoutInfo = () => {

    
    const name = document.getElementById("customerName").value
    const email = document.getElementById("customerEmail").value

    const cardNum = document.getElementById("cardNum").value
    const cardExp = document.getElementById("cardExp").value

    if (name.trim() === "" || email.trim() === "" || cardNum.trim() === "" || cardExp.trim() === ""
      || name === undefined || email === undefined || cardNum === undefined || cardExp === undefined) {
        document.getElementById("error").innerText="Please, insert all data"
        return
    }
   const verify_email=expReg = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/
    let verify_email2=verify_email.test(email)

    if (verify_email2 === false) {
        document.getElementById("error").innerText="Please, insert a valid Email"
        return
    }

   const cardNumber = parseInt(cardNum)
 
   if (isNaN(name) === false) {
        document.getElementById("error").innerText="Please, insert a valid Name"
       return
    }

    const verify_card = expReg = /^[0-9]{13,19}$/
    if (isNaN(cardNumber) === true || verify_card.test(cardNumber) === false) {
        document.getElementById("error").innerText="Please, insert a valid Credit Card Number"
        return
    }

    let dataObj = {
        Name: name,
        Email: email,
        Membership: memToSave,
        CardNumber: cardNum,
        CardExpiryDate: cardExp,
        ToTal: totalDb,
    }

    console.log(dataObj)
    makeAPIRequest("/purchase", "POST", dataObj)
    
    window.location.replace("http://localhost:3000/confirmed")
}

const setClassButtons = () => {
    fetchRequest = fetch("/userclass", {method: "GET", headers: {'Content-Type' : 'application/json'}})
    
    fetchRequest.then(response => {
        return (response.ok) ? response.json() : Promise.reject("Unable to save data")
    })
    .then(responseJSONData => {
        console.log(`Response from API ${responseJSONData.message}`)
        for(let i = 0; i<responseJSONData.length; i++){
            if(document.getElementById(`${responseJSONData[i].userEmail}_${responseJSONData[i].title}`) !== null){
                document.getElementById(`${responseJSONData[i].userEmail}_${responseJSONData[i].title}`).disabled = true
                document.getElementById(`${responseJSONData[i].userEmail}_${responseJSONData[i].title}`).innerText = "Already booked"
                document.getElementById(`text_${responseJSONData[i].userEmail}_${responseJSONData[i].title}`).innerText = "Already booked"
            }
        }
    })
    .catch(err => {
        console.log(`Error :  ${err}`)
    })
}
addClass = (classId) => {
    makeAPIRequest(`/classes/${classId}`, "POST")
}

window.onload = () => {
    purchaseLoad()
    setClassButtons()
    
}
