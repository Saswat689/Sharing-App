const dropZone = document.querySelector(".drop-zone")
const fileInput = document.querySelector("#fileInput")
const browseBtn = document.querySelector(".browseBtn")
const bgProgress = document.querySelector(".bg-progress")
const percentDiv = document.querySelector("#percent")
const progressBar = document.querySelector(".progress-bar")
const progressContainer = document.querySelector(".progress-container")
const fileURL = document.querySelector("#fileURL")
const sharingContainer = document.querySelector(".sharing-container")
const copyBtn = document.querySelector("#copyBtn")
const emailForm = document.querySelector("#emailForm")
const toast = document.querySelector(".toast")

const host = "https://inshare.herokuapp.com"
const uploadURL = host + "/api/files"
const emailURL = host + "/api/files/send"

const maxFileSize = 100 * 1024 * 1024 //100mb

dropZone.addEventListener("dragover",(e) => {
	//prevent default download behaviour
	e.preventDefault();

	if(!dropZone.classList.contains("dragged")) {
		dropZone.classList.add("dragged")
	}
})

dropZone.addEventListener("dragleave",() => {
	dropZone.classList.remove("dragged")
})

dropZone.addEventListener("drop",(e) => {
	//prevent default download behaviour
	e.preventDefault();
	dropZone.classList.remove("dragged")

	const files = e.dataTransfer.files
	console.table(files)
	if (files.length) {
		fileInput.files = files
		uploadFile()
	}
})

fileInput.addEventListener("change",() => {
	uploadFile()
})

browseBtn.addEventListener("click",() => {
	fileInput.click()
})

copyBtn.addEventListener("click",() => {
	fileURL.select()
	document.execCommand("copy")
	showToast("Link copied")
})

const uploadFile = ()  => {

	if(fileInput.files.length > 1) {
		fileInput.value = ""
		showToast("Only upload 1 file")
		return
	}

	const file = fileInput.files[0]

	if(file.size > maxFileSize) {
		showToast("Can't upload more than 100mb file")
		fileInput.value = ""
		return
	}
	progressContainer.style.display = "block"

	const formData = new FormData()
	formData.append("myfile",file)

	const xhr = new XMLHttpRequest()
	xhr.onreadystatechange = () => {
		if(xhr.readyState == XMLHttpRequest.DONE) {
			console.log(xhr.response)
			onUploadSuccess(JSON.parse(xhr.reponse))
		}
	}

	xhr.upload.onprogress = updateProgress;

	xhr.upload.onerror = () => {
		fileInput.value = ""
		showToast(`Error in upload: ${xhr.statusText}`)
	}

	xhr.open("POST",uploadURL)
	xhr.send(formData)
}

const updateProgress = (e) => {
	const percent = Math.round(e.loaded / e.total * 100)
	// console.log(e)
	bgProgress.style.width = percent + "%"
	percentDiv.innerText = percent + "%"
	progressBar.style.transform = `scale(${percent/100})`
}

const onUploadSuccess = ({ file: url }) => {

	fileInput.value = ""
	emailForm[2].removeAttribute("disabled")

	progressContainer.style.display = "none"
	sharingContainer.style.display = "block"

	fileURL.value = url
}

emailForm.addEventListener("submit",(e) => {
	e.preventDefault()
	const formData = {
		uuid: fileURL.value.split("/").splice(-1,1)[0],
		emailTo: emailForm.elements["to-email"].value,
		emailFrom: emailForm.elements["from-email"].value
	}

	emailForm[2].setAttribute("disabled","true")

	fetch(emailURL,{
		method: "POST",
		headers: {
			"Content-Type": "application/json"
		},
		body: JSON.stringify(formData)
	})
	.then(res => res.json())
	.then(({success}) => {
		sharingContainer.style.display = "none"
	})
})
let toastTimer;
const showToast = (msg) => {
	
	toast.innerText = msg;
	toast.style.transform = `translate(-50%,0)`;
	clearTimeout(toastTimer)
	toastTimer = setTimeout(() => {
		toast.style.transform = `translate(-50%,200px)`;
	},2000)
}

