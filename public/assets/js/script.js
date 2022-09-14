const $ = el => {
   return document.getElementById(el)
}

function upload() {
   var file = $('files').files[0]
   var formdata = new FormData()
   formdata.append('files', file)
   var ajax = new XMLHttpRequest()
   ajax.upload.addEventListener('progress', progressHandler, false)
   ajax.addEventListener('load', completeHandler, false)
   ajax.addEventListener('error', errorHandler, false)
   ajax.addEventListener('abort', abortHandler, false)
   ajax.open('POST', '/upload')
   ajax.send(formdata)
}

function progressHandler(event) {
   var percent = (event.loaded / event.total) * 100
   $('file-upload__label').innerHTML = 'Please wait ... ' + Math.round(percent) + '%'
}

function completeHandler(event) {
   $('file-upload__label').innerHTML = event.target.responseText
   if (/complete/i.test(event.target.responseText)) {
      var id = event.target.responseText.split(':')[1].trim()
      window.location = '/file/' + id
   } else {
      setTimeout(function() {
         $('file-upload__label').innerHTML = 'Select or drop files here'
      }, 1500)
   }
}

function errorHandler(event) {
   $('file-upload__label').innerHTML = 'Something went wrong'
   setTimeout(function() {
      $('file-upload__label').innerHTML = 'Select or drop files here'
   }, 1500)
}

function abortHandler(event) {
   $('file-upload__label').innerHTML = 'Upload aborted'
   setTimeout(function() {
      $('file-upload__label').innerHTML = 'Select or drop files here'
   }, 1500)
}