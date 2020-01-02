// Document elements
const statsPanel = document.getElementById("stats")
const numDwellersPanel = document.getElementById("numDwellers")
const levelPanel = document.getElementById('level')
const expBar = document.getElementById('exp-bar')
const resourceBar = document.getElementById('resource-bar')

const mainPanel = document.getElementById("panel")
const dwellersPanel = document.getElementById("dwellers")
const upgradeInfoPanel = document.getElementById('upgrade-info')

// Internal statistics
let level = 1
let exp = 0
let dwellers = []
let resources = 50
let dwellerCount = 0
let initialized = false
let upgradesUsed = 1

// Debugging variables
let hi = 0

// Dweller state enum

let State = {
	REST: 1,
	WORK: 2,
	EXPLORE: 3,
	DEAD: 4
}

async function start() {
	// Clear the start button
	mainPanel.innerHTML = ""

	// Initialize first 3 dwellers
	let dweller = newDweller(randomName(), 2, 1, 1)
	let dweller2 = newDweller(randomName(), 2, 3, 2)
	let dweller3 = newDweller(randomName(), 3, 1, 2)

	// Initialize level
	await updateLevel()
	await updateResources()
	await initializeDwellerPanel()

	/*
	// Add exp button
	let expButton = document.createElement('button')
	expButton.setAttribute('type', 'button')
	expButton.setAttribute('onclick', 'addEXP(10)')
	expButton.innerText = 'Add 10 exp!'
	mainPanel.appendChild(expButton)
	*/

	run()
}

class Dweller {
	constructor(name, strength, iq, charisma) {
		this.name = name
		this.strength = strength
		this.iq = iq
		this.charisma = charisma
		this.status = State.WORK
		this.id = dwellers.length + 1
		this.stamina = 100
		this.level = 1
		this.exp = 0
		this.health = 20
		this.maxHealth = 20
	}

	getName() {
		return this.name
	}

	getStrength() {
		return this.strength
	}

	getIQ() {
		return this.iq
	}

	getCharisma() {
		return this.charisma
	}

	setStrength(num) {
		this.strength = num
		refreshDwellerPanel()
	}

	setIQ(num) {
		this.iq = num
		refreshDwellerPanel()
	}

	setCharisma(num) {
		this.charisma = num
		refreshDwellerPanel()
	}

	getStatus() {
		return this.status
	}

	setStatus(newState) {
		this.status = newState
		refreshDwellerPanel()
	}

	getID() {
		return this.id
	}

	getStamina() {
		return this.stamina
	}

	addStamina(num) {
		this.stamina += num
		if (this.stamina > 100) {
			this.stamina = 100
		}

		document.getElementById(`stamina-${this.id}`).style.width = this.stamina + '%'
		document.getElementById(`stamina-${this.id}`).textContent = this.stamina
		if (this.stamina == 100) {
			document.getElementById(`stamina-${this.id}`).setAttribute('class', 'progress-bar bg-success')
		} else if (this.stamina <= 20) {
			document.getElementById(`stamina-${this.id}`).setAttribute('class', 'progress-bar bg-danger')
		} else if (this.stamina <= 30) {
			document.getElementById(`stamina-${this.id}`).setAttribute('class', 'progress-bar bg-warning')
		} else {
			document.getElementById(`stamina-${this.id}`).setAttribute('class', 'progress-bar')
		}
	}

	removeStamina(num) {
		if (this.level < 5) {
			this.stamina -= num
		} else if (this.level < 10) {
			this.stamina -= num/1.5
		} else {
			this.stamina -= num/2
		}
		if (this.stamina <= 0) {
			this.stamina = 0
			this.setStatus(State.REST)
		}

		document.getElementById(`stamina-${this.id}`).style.width = this.stamina + '%'
		document.getElementById(`stamina-${this.id}`).textContent = this.stamina
		if (this.stamina == 100) {
			document.getElementById(`stamina-${this.id}`).setAttribute('class', 'progress-bar bg-success')
		} else if (this.stamina <= 20) {
			document.getElementById(`stamina-${this.id}`).setAttribute('class', 'progress-bar bg-danger')
		} else if (this.stamina <= 30) {
			document.getElementById(`stamina-${this.id}`).setAttribute('class', 'progress-bar bg-warning')
		} else {
			document.getElementById(`stamina-${this.id}`).setAttribute('class', 'progress-bar')
		}
	}

	getLevel() {
		return this.level
	}

	getEXP() {
		return this.exp
	}

	addDwellerEXP(num) {
		this.exp += num
		this.calculateLevel()
	}

	calculateLevel() {
		// Calculated linearly every 25
		let tempLevel = this.exp/25
		if (tempLevel < 1.0) {
			this.level = 1
		} else {
			this.level = parseInt(tempLevel, 10) + 1
		}

		refreshDwellerPanel()
	}

	getHealth() {
		return this.health
	}

	subtractHealth(num) {
		this.health -= num

		if (this.health <= 0) {
			this.health = 0
			this.status = State.DEAD
		}
	}

	addHealth(num) {
		this.health += num

		if (this.health > this.maxHealth) {
			this.health = maxHealth
		}
	}

	getMaxHealth() {
		return this.maxHealth
	}

	setMaxHealth(num) {
		this.maxHealth = num
	}
}

function newDweller(name, strength, iq, charisma) {
	let dweller = new Dweller(name, strength, iq, charisma)
	dwellers.push(dweller)
	updateDwellerCount()
	return dweller
}

function randomName() {
	let number = Math.random()
	if (number < 0.1) {
		return "Craig"
	} else if (number < 0.2) {
		return "Roger"
	} else if (number < 0.3) {
		return "Butler"
	} else if (number < 0.4) {
		return "Cheryl"
	} else if (number < 0.5) {
		return "George"
	} else if (number < 0.6) {
		return "Carol"
	} else if (number < 0.7) {
		return "Willie"
	} else if (number < 0.8) {
		return "Kathryn"
	} else if (number < 0.9) {
		return "Steve"
	} else {
		return "Amigo"
	}
}

function updateDwellerCount() {
	if (dwellers.length > 1) {
		numDwellersPanel.innerHTML = `<b>${dwellers.length}</b> dwellers`
	} else {
		numDwellersPanel.innerHTML = "<b>1</b> dweller"
	}
}

function initializeDwellerPanel() {
	// Clear the panel first
	dwellersPanel.innerHTML = ''

	// Update variables
	initialized = true

	// Iterate through
	let i
	for (i = 0; i < dwellers.length; i++) {
		// Necessary row and column
		let dwellerRow = document.createElement('div')
		dwellerRow.setAttribute('class', 'row')
		dwellerRow.setAttribute('style', 'margin: 2px')
		dwellerRow.setAttribute('id', `row-${dwellers[i].getID()}`)

		let dwellerCol = document.createElement('div')
		dwellerCol.setAttribute('class', 'col')

		// Card and card body
		let dwellerCard = document.createElement('div')
		dwellerCard.setAttribute('class', 'card')

		let dwellerBody = document.createElement('div')
		dwellerBody.setAttribute('class', 'card-body')

		// Dweller name and level
		let dwellerName = document.createElement('h6')
		dwellerName.setAttribute('class', 'card-title')
		dwellerName.innerText = `${dwellers[i].getName()} `

		let dwellerLevel = document.createElement('small')
		dwellerLevel.setAttribute('class', 'text-muted')
		dwellerLevel.setAttribute('id', `level-${dwellers[i].getID()}`)
		dwellerLevel.textContent = `Level ${dwellers[i].getLevel()}`

		// Dweller health
		let dwellerHealth = document.createElement('div')
		dwellerHealth.setAttribute('class', 'progress')
		dwellerHealth.setAttribute('style', 'height: 4px')
		dwellerHealth.innerHTML = `
		<div class="progress-bar bg-danger" role="progressbar" id="health-${dwellers[i].getID()}"style="width: ${(dwellers[i].getHealth()/dwellers[i].getMaxHealth())*100}%;" aria-valuenow="${dwellers[i].getHealth()}" aria-valuemin="0" aria-valuemax="${dwellers[i].getMaxHealth()}"></div>
		`

		// Dweller stats
		let dwellerStats = document.createElement('div')
		dwellerStats.setAttribute('class', 'card-text')
		dwellerStats.innerHTML = '</br>'

		let dwellerStrength = document.createElement('p')
		dwellerStrength.setAttribute('id', `strength-${dwellers[i].getID()}`)
		dwellerStrength.innerHTML = "Strength = " + dwellers[i].getStrength()

		let dwellerIQ = document.createElement('p')
		dwellerIQ.setAttribute('id', `iq-${dwellers[i].getID()}`)
		dwellerIQ.innerHTML = "IQ = " + dwellers[i].getIQ()

		let dwellerCharisma = document.createElement('p')
		dwellerCharisma.setAttribute('id', `charisma-${dwellers[i].getID()}`)
		dwellerCharisma.innerHTML = "Charisma = " + dwellers[i].getCharisma()

		// Dweller state
		let dwellerState = document.createElement('div')
		dwellerState.setAttribute('class', 'card-text')
		dwellerState.setAttribute('id', `dweller-${dwellers[i].getID()}`)
		if (dwellers[i].getStatus() == State.REST) {
			dwellerState.innerText = "Currently resting"
		} else if (dwellers[i].getStatus() == State.WORK) {
			dwellerState.innerText = "Currently working"
		} else if (dwellers[i].getStatus() == State.EXPLORE) {
			dwellerState.innerText = "Currently exploring"
		}

		// Dweller stamina
		let dwellerStaminaBar = document.createElement('div')
		dwellerStaminaBar.setAttribute('class', 'progress')
		let dwellerStamina = dwellers[i].getStamina()
		dwellerStaminaBar.innerHTML = `<div class="progress-bar" role="progressbar" id="stamina-${dwellers[i].getID()}" style="width: ${dwellers[i].getStamina()}%" aria-valuenow="${dwellers[i].getStamina()}" aria-valuemin="0" aria-valuemax="100">${dwellers[i].getStamina()}</div>`

		// Toggle dweller states
		let dwellerToggles = document.createElement('div')
		dwellerToggles.setAttribute('class', 'btn-group btn-group-toggle')
		dwellerToggles.setAttribute('data-toggle', 'buttons')
		dwellerToggles.setAttribute('id', `toggle-${dwellers[i].getID()}`)
		dwellerToggles.innerHTML = `
		<label class="btn btn-secondary">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.REST)"> Rest
		</label>
		<label class="btn btn-secondary active">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.WORK)" checked> Work
		</label>
		<label class="btn btn-secondary">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.EXPLORE)"> Explore
		</label>`

		dwellerStats.appendChild(dwellerStrength)
		dwellerStats.appendChild(dwellerIQ)
		dwellerStats.appendChild(dwellerCharisma)

		dwellerName.appendChild(dwellerLevel)
		dwellerBody.appendChild(dwellerName)
		dwellerBody.appendChild(dwellerHealth)
		dwellerBody.appendChild(dwellerStats)
		dwellerBody.appendChild(dwellerStaminaBar)
		dwellerBody.appendChild(dwellerState)
		dwellerBody.appendChild(dwellerToggles)
		dwellerCard.appendChild(dwellerBody)
		dwellerCol.appendChild(dwellerCard)
		dwellerRow.appendChild(dwellerCol)

		dwellersPanel.appendChild(dwellerRow)

		dwellerCount++
	}
}

function refreshDwellerPanel() {
	if (!initialized) {
		initializeDwellerPanel()
		return
	}

	if (dwellerCount < dwellers.length) {
		addDwellerCard()
	}

	let i
	for (i = 0; i < dwellers.length; i++) {
		// Update level
		let dwellerLevel = document.getElementById(`level-${dwellers[i].getID()}`)
		dwellerLevel.textContent = `Level ${dwellers[i].getLevel()}`

		// Update health
		let dwellerHealth = document.getElementById(`health-${dwellers[i].getID()}`)
		dwellerHealth.style.width = (dwellers[i].getHealth()/dwellers[i].getMaxHealth())*100 + '%'

		// Update stats
		let dwellerStrength = document.getElementById(`strength-${dwellers[i].getID()}`)
		dwellerStrength.innerHTML = "Strength = " + dwellers[i].getStrength() + " "

		if (level > upgradesUsed) {
			let upgradeStrength = document.createElement('span')
			upgradeStrength.setAttribute('class', 'badge badge-success')
			upgradeStrength.setAttribute('onclick', `upgradeDwellerStat('str', ${dwellers[i].getID()})`)
			upgradeStrength.textContent = '+'

			dwellerStrength.appendChild(upgradeStrength)
		}

		let dwellerIQ = document.getElementById(`iq-${dwellers[i].getID()}`)
		dwellerIQ.innerHTML = "IQ = " + dwellers[i].getIQ() + " "

		if (level > upgradesUsed) {
			let upgradeIQ = document.createElement('span')
			upgradeIQ.setAttribute('class', 'badge badge-success')
			upgradeIQ.setAttribute('onclick', `upgradeDwellerStat('iq', ${dwellers[i].getID()})`)
			upgradeIQ.textContent = '+'

			dwellerIQ.appendChild(upgradeIQ)
		}

		let dwellerCharisma = document.getElementById(`charisma-${dwellers[i].getID()}`)
		dwellerCharisma.innerHTML = "Charisma = " + dwellers[i].getCharisma() + " "

		if (level > upgradesUsed && dwellers[i].getCharisma() < 7) {
			let upgradeCharisma = document.createElement('span')
			upgradeCharisma.setAttribute('class', 'badge badge-success')
			upgradeCharisma.setAttribute('onclick', `upgradeDwellerStat('char', ${dwellers[i].getID()})`)
			upgradeCharisma.textContent = '+'

			dwellerCharisma.appendChild(upgradeCharisma)
		}

		// Update state and toggle
		let dwellerState = document.getElementById(`dweller-${dwellers[i].getID()}`)
		if (dwellers[i].getStatus() == State.REST) {
			dwellerState.innerText = "Currently resting"
		} else if (dwellers[i].getStatus() == State.WORK) {
			dwellerState.innerText = "Currently working"
		} else if (dwellers[i].getStatus() == State.EXPLORE) {
			dwellerState.innerText = "Currently exploring"
		}

		let dwellerToggles = document.getElementById(`toggle-${dwellers[i].getID()}`)
		if (dwellers[i].getStatus() == State.REST) {
			dwellerToggles.innerHTML = `
		<label class="btn btn-secondary active">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.REST)" checked> Rest
		</label>
		<label class="btn btn-secondary">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.WORK)"> Work
		</label>
		<label class="btn btn-secondary">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.EXPLORE)"> Explore
		</label>`
		} else if (dwellers[i].getStatus() == State.WORK) {
			dwellerToggles.innerHTML = `
		<label class="btn btn-secondary">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.REST)"> Rest
		</label>
		<label class="btn btn-secondary active">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.WORK)" checked> Work
		</label>
		<label class="btn btn-secondary">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.EXPLORE)"> Explore
		</label>`
		} else if (dwellers[i].getStatus() == State.EXPLORE) {
			dwellerToggles.innerHTML = `
		<label class="btn btn-secondary">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.REST)"> Rest
		</label>
		<label class="btn btn-secondary">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.WORK)"> Work
		</label>
		<label class="btn btn-secondary active">
			<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.EXPLORE)" checked> Explore
		</label>`
		}
	}
}

function addDwellerCard() {
	let i = dwellerCount
	// Necessary row and column
	let dwellerRow = document.createElement('div')
	dwellerRow.setAttribute('class', 'row')
	dwellerRow.setAttribute('style', 'margin: 2px')
	dwellerRow.setAttribute('id', `row-${dwellers[i].getID()}`)

	let dwellerCol = document.createElement('div')
	dwellerCol.setAttribute('class', 'col')

	// Card and card body
	let dwellerCard = document.createElement('div')
	dwellerCard.setAttribute('class', 'card')

	let dwellerBody = document.createElement('div')
	dwellerBody.setAttribute('class', 'card-body')

	// Dweller name and level
	let dwellerName = document.createElement('h6')
	dwellerName.setAttribute('class', 'card-title')
	dwellerName.innerText = `${dwellers[i].getName()} `

	let dwellerLevel = document.createElement('small')
	dwellerLevel.setAttribute('class', 'text-muted')
	dwellerLevel.setAttribute('id', `level-${dwellers[i].getID()}`)
	dwellerLevel.textContent = `Level ${dwellers[i].getLevel()}`

	// Dweller health
	let dwellerHealth = document.createElement('div')
	dwellerHealth.setAttribute('class', 'progress')
	dwellerHealth.setAttribute('style', 'height: 4px')
	dwellerHealth.innerHTML = `
	<div class="progress-bar bg-danger" role="progressbar" id="health-${dwellers[i].getID()}"style="width: ${(dwellers[i].getHealth()/dwellers[i].getMaxHealth())*100}%;" aria-valuenow="${dwellers[i].getHealth()}" aria-valuemin="0" aria-valuemax="${dwellers[i].getMaxHealth()}"></div>
	`

	// Dweller stats
	let dwellerStats = document.createElement('div')
	dwellerStats.setAttribute('class', 'card-text')
	dwellerStats.innerHTML = '</br>'

	let dwellerStrength = document.createElement('p')
	dwellerStrength.setAttribute('id', `strength-${dwellers[i].getID()}`)
	dwellerStrength.innerHTML = "Strength = " + dwellers[i].getStrength()

	let dwellerIQ = document.createElement('p')
	dwellerIQ.setAttribute('id', `iq-${dwellers[i].getID()}`)
	dwellerIQ.innerHTML = "IQ = " + dwellers[i].getIQ()

	let dwellerCharisma = document.createElement('p')
	dwellerCharisma.setAttribute('id', `charisma-${dwellers[i].getID()}`)
	dwellerCharisma.innerHTML = "Charisma = " + dwellers[i].getCharisma()

	// Dweller state
	let dwellerState = document.createElement('div')
	dwellerState.setAttribute('class', 'card-text')
	dwellerState.setAttribute('id', `dweller-${dwellers[i].getID()}`)
	if (dwellers[i].getStatus() == State.REST) {
		dwellerState.innerText = "Currently resting"
	} else if (dwellers[i].getStatus() == State.WORK) {
		dwellerState.innerText = "Currently working"
	} else if (dwellers[i].getStatus() == State.EXPLORE) {
		dwellerState.innerText = "Currently exploring"
	}

	// Dweller stamina
	let dwellerStaminaBar = document.createElement('div')
	dwellerStaminaBar.setAttribute('class', 'progress')
	let dwellerStamina = dwellers[i].getStamina()
	dwellerStaminaBar.innerHTML = `<div class="progress-bar" role="progressbar" id="stamina-${dwellers[i].getID()}" style="width: ${dwellers[i].getStamina()}%" aria-valuenow="${dwellers[i].getStamina()}" aria-valuemin="0" aria-valuemax="100">${dwellers[i].getStamina()}</div>`

	// Toggle dweller states
	let dwellerToggles = document.createElement('div')
	dwellerToggles.setAttribute('class', 'btn-group btn-group-toggle')
	dwellerToggles.setAttribute('data-toggle', 'buttons')
	dwellerToggles.setAttribute('id', `toggle-${dwellers[i].getID()}`)
	dwellerToggles.innerHTML = `
	<label class="btn btn-secondary">
		<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.REST)"> Rest
	</label>
	<label class="btn btn-secondary active">
		<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.WORK)" checked> Work
	</label>
	<label class="btn btn-secondary">
		<input type="radio" name="options" onclick="updateDwellerState(${dwellers[i].getID()}, State.EXPLORE)"> Explore
	</label>`

	dwellerStats.appendChild(dwellerStrength)
	dwellerStats.appendChild(dwellerIQ)
	dwellerStats.appendChild(dwellerCharisma)

	dwellerName.appendChild(dwellerLevel)
	dwellerBody.appendChild(dwellerName)
	dwellerBody.appendChild(dwellerHealth)
	dwellerBody.appendChild(dwellerStats)
	dwellerBody.appendChild(dwellerStaminaBar)
	dwellerBody.appendChild(dwellerState)
	dwellerBody.appendChild(dwellerToggles)
	dwellerCard.appendChild(dwellerBody)
	dwellerCol.appendChild(dwellerCard)
	dwellerRow.appendChild(dwellerCol)

	dwellersPanel.appendChild(dwellerRow)

	dwellerCount++

	if (dwellerCount < dwellers.length) {
		addDwellerCard()
	}
}

async function updateLevel() {
	// Calculate current level (currently linear progression every 25)
	let calcLevel = exp/25
	if (calcLevel < 1.0) {
		level = 1
	} else {
		level = parseInt(calcLevel, 10) + 1
	}

	// Update level panel
	levelPanel.innerHTML = `Level <b>${level}</b> (exp: ${exp})`
	expBar.innerHTML = `<div class="progress-bar" role="progressbar" style="width: ${100*(calcLevel - Math.floor(calcLevel))}%" aria-valuenow="${calcLevel - Math.floor(calcLevel)}" aria-valuemin="0" aria-valuemax="1"><div id="expText" style="position: relative">${exp%25}/25</div></div>`

	if (upgradesUsed < level) {
		upgradeInfoPanel.innerHTML = `
		<p class="lead" style="color: green; font-size: 18px">${level-upgradesUsed} upgrade(s) available!</p>
		`
	}
}

function updateLevelBy(num) {
	// Calculate current level (currently linear progression every 25)
	let calcLevel = exp/25
	if (calcLevel < 1.0) {
		level = 1
	} else {
		level = parseInt(calcLevel, 10) + 1
	}

	// Update level panel
	levelPanel.innerHTML = `Level <b>${level}</b> (exp: ${exp})`
	expBar.innerHTML = `<div class="progress-bar" role="progressbar" style="width: ${100*(calcLevel - Math.floor(calcLevel))}%" aria-valuenow="${calcLevel - Math.floor(calcLevel)}" aria-valuemin="0" aria-valuemax="1"><div id="expText" style="position: relative">${exp%25}/25</div></div>`

	// Create a new element
	let ghostNum = document.getElementById('ghostNum')
	let leftPos = ((document.getElementById('expText').getBoundingClientRect().right)-(document.getElementById('expText').getBoundingClientRect().left))/2
	ghostNum.style = `position: absolute; left: ${leftPos}; top: 0`
	ghostNum.textContent = num

	let i = 0
	window.setInterval(function() {
		i++
		ghostNum.style = `position: absolute; left: ${leftPos}; top: ${-i}`

		if (i > 10) {
			clearInterval()
		}
	}, 100)
}

function updateResources() {
	// Update resource level
	resourceBar.innerHTML = `<div class="progress-bar" role="progressbar" style="width: ${100*(resources/50.0)}%" aria-valuenow="${resources}" aria-valuemin="0" aria-valuemax="50">${resources}/50</div>`
}

function addEXP(num) {
	exp += num
	updateLevel()
}

function addResources(num) {
	resources += num
	if (resources > 50) {
		resources = 50
	} else if (resources < 0) {
		resources = 0
	}
	updateResources()
}

// Main function for maintaining work
async function run() {
	// Reduce resources
	await addResources(-dwellers.length)

	// Calculate step
	await calculateWork()
	await calculateRest()
	await calculateExplore()

	// Refresh dwellers panel
	await refreshDwellerPanel()

	setTimeout(run, 1000)
}

function calculateWork() {
	// Generating resource pool
	let strength = 0.0
	let iq = 0.0
	let charisma = 0.0
	let workers = 0

	let i
	for (i = 0; i < dwellers.length; i++) {
		if (dwellers[i].getStatus() == State.WORK && dwellers[i].getStamina() > 0) {
			strength += dwellers[i].getStrength() * (dwellers[i].getStamina()/100)
			iq += dwellers[i].getIQ() * (dwellers[i].getStamina()/100)
			charisma += dwellers[i].getCharisma() * (dwellers[i].getStamina()/100)
			workers++
			dwellers[i].removeStamina(6)
			dwellers[i].addDwellerEXP(10)
		}
	}

	// Update current work pool
	if (workers == 1) {
		mainPanel.innerHTML = `<b>${workers}</b> worker is contributing <b>${Math.round(strength)}</b> strength and <b>${Math.round(iq)}</b> IQ.`
	} else {
		mainPanel.innerHTML = `<b>${workers}</b> workers are contributing <b>${Math.round(strength)}</b> strength and <b>${Math.round(iq)}</b> IQ.`
	}

	// Add resources and exp
	addEXP(Math.round(iq))
	addResources(Math.round(strength))
}

function calculateRest() {
	for (i = 0; i < dwellers.length; i++) {
		if (dwellers[i].getStatus() == State.REST) {
			dwellers[i].addStamina(8)
		}
	}
}

function calculateExplore() {
	for (i = 0; i < dwellers.length; i++) {
		if (dwellers[i].getStatus() == State.EXPLORE) {
			dwellers[i].subtractHealth(2)
			let num = Math.random()
			if (num > (dwellers[i].getCharisma()/7)) {
				newDweller(randomName(), 2, 1, 2)
			}
		}
	}
}

function updateDwellerState(dwellerID, newState) {
	dwellers[dwellerID-1].setStatus(newState)
}

function loadBar(barID, current, target) {
	// Holds the current state of the bar
	let fill = current

	// Calculate the interval that the bar should fill by
	let increment = (target-current)

	window.setInterval(function(){

		if (fill == target) {
			clearInterval();
			return;
		} else {
			changeBar(barID, fill)
			fill += increment
		}

	}, 1500)
}

function changeBar(barID, target) {
	document.getElementById(`${barID}`).style.width = target + '%'
	document.getElementById(`${barID}`).textContent = Math.round(target)
	if (target == 100) {
		document.getElementById(`${barID}`).setAttribute('class', 'progress-bar bg-success')
	} else if (target <= 20) {
		document.getElementById(`${barID}`).setAttribute('class', 'progress-bar bg-danger')
	} else if (target <= 30) {
		document.getElementById(`${barID}`).setAttribute('class', 'progress-bar bg-warning')
	} else {
		document.getElementById(`${barID}`).setAttribute('class', 'progress-bar')
	}
}

function upgradeDwellerStat(stat, id) {
	upgradesUsed++
	refreshDwellerPanel()

	if (upgradesUsed < level) {
		upgradeInfoPanel.innerHTML = `
		<p class="lead" style="color: green; font-size: 18px">${level-upgradesUsed} upgrade(s) available!</p>
		`
	} else if (upgradesUsed == level) {
		upgradeInfoPanel.innerHTML = ""
	}

	if (stat === "str") {
		dwellers[id-1].setStrength(dwellers[id-1].getStrength()+1)
	} else if (stat === "iq") {
		dwellers[id-1].setIQ(dwellers[id-1].getIQ()+1)
	} else if (stat === "char") {
		dwellers[id-1].setCharisma(dwellers[id-1].getCharisma()+1)
	}
}

















