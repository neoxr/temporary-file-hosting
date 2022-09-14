module.exports = class Function {
	makeId = (length) => {
      var result = ''
      var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrtuvwxyz0123456789'
      var charactersLength = characters.length
      for (var i = 0; i < length; i++) {
         result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
   }
   
   formatSize = (size) => {
      function round(value, precision) {
         var multiplier = Math.pow(10, precision || 0)
         return Math.round(value * multiplier) / multiplier
      }
      var megaByte = 1024 * 1024
      var gigaByte = 1024 * megaByte
      var teraByte = 1024 * gigaByte
      if (size < 1024) {
         return size + ' B'
      } else if (size < megaByte) {
         return round(size / 1024, 1) + ' KB'
      } else if (size < gigaByte) {
         return round(size / megaByte, 1) + ' MB'
      } else if (size < teraByte) {
         return round(size / gigaByte, 1) + ' GB'
      } else {
         return round(size / teraByte, 1) + ' TB'
      }
      return ''
   }
   
   timeout = (duration) => {
      let milliseconds = parseInt((duration % 1000) / 100),
         seconds = Math.floor((duration / 1000) % 60),
         minutes = Math.floor((duration / (1000 * 60)) % 60),
         hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
         days = Math.floor(duration / (24 * 60 * 60 * 1000))
      let hoursF = (hours < 10) ? "0" + hours : hours
      let minutesF = (minutes < 10) ? "0" + minutes : minutes
      let secondsF = (seconds < 10) ? "0" + seconds : seconds
      let daysF = (days < 10) ? "0" + days : days
      // return hours + " Jam " + minutes + " Menit" + seconds + " Detik" + milliseconds;
      return daysF + "D " + hoursF + "H " + minutesF + "M"
   }
   
   delay = time => new Promise(res => setTimeout(res, time))
}