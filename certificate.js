const { PDFDocument, StandardFonts } = require('pdf-lib')
const QRCode = require('qrcode')
var fs = require('fs')
const Blob = require("cross-blob")


function generateQR (text) {
  const opts = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    quality: 0.92,
    margin: 1,
  }
  return QRCode.toDataURL(text, opts)
}

const ys = {
  travail: 550,
  achats: 480,
  sante: 432,
  famille: 408,
  handicap: 372,
  sport_animaux: 347,
  convocation: 275,
  missions: 250,
  enfants: 227,
}

async function generatePdf (profile, pdfBase) {

  const {
    lastname,
    firstname,
    birthday,
    placeofbirth,
    address,
    zipcode,
    city,
    datesortie,
    heuresortie,
    reasons,
    creationDate,
	  creationHour
  } = profile

  const data = [
    `Cree le: ${creationDate} a ${creationHour}`,
    `Nom: ${lastname}`,
    `Prenom: ${firstname}`,
    `Naissance: ${birthday} a ${placeofbirth}`,
    `Adresse: ${address} ${zipcode} ${city}`,
    `Sortie: ${datesortie} a ${heuresortie}`,
    `Motifs: ${reasons};`,
  ].join(';\n ')

  const existingPdfBytes = fs.readFileSync(pdfBase);

  const pdfDoc = await PDFDocument.load(existingPdfBytes)

  // set pdf metadata
  pdfDoc.setTitle('COVID-19 - Déclaration de déplacement')
  pdfDoc.setSubject('Attestation de déplacement dérogatoire')
  pdfDoc.setKeywords([
    'covid19',
    'covid-19',
    'attestation',
    'déclaration',
    'déplacement',
    'officielle',
    'gouvernement',
  ])
  pdfDoc.setProducer('DNUM/SDIT')
  pdfDoc.setCreator('')
  pdfDoc.setAuthor("Ministère de l'intérieur")

  const page1 = pdfDoc.getPages()[0]

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const drawText = (text, x, y, size = 11) => {
    page1.drawText(text, { x, y, size, font })
  }

  drawText(`${firstname} ${lastname}`, 93, 703)
  drawText(birthday, 90, 684)
  drawText(placeofbirth, 213, 684)
  drawText(`${address} ${zipcode} ${city}`, 103, 665)

  reasons
    .split(', ')
    .forEach(reason => {
      drawText('x', 47, ys[reason], 15)
    })

  let locationSize = getIdealFontSize(font, profile.city, 83, 7, 11)

  drawText(profile.city, 81, 77, locationSize)
  drawText(`${profile.datesortie}`, 62, 58, 11)
  drawText(`${profile.heuresortie}`, 227, 58, 11)

  const generatedQR = await generateQR(data)

  const qrImage = await pdfDoc.embedPng(generatedQR)

  page1.drawImage(qrImage, {
    x: page1.getWidth() - 156,
    y: 25,
    width: 92,
    height: 92,
  })

  pdfDoc.addPage()
  const page2 = pdfDoc.getPages()[1]
  page2.drawImage(qrImage, {
    x: 50,
    y: page2.getHeight() - 350,
    width: 300,
    height: 300,
  })

  const pdfBytes = await pdfDoc.save()

  return new Blob([pdfBytes], { type: 'application/pdf' })
}

function getIdealFontSize (font, text, maxWidth, minSize, defaultSize) {
  let currentSize = defaultSize
  let textWidth = font.widthOfTextAtSize(text, defaultSize)

  while (textWidth > maxWidth && currentSize > minSize) {
    textWidth = font.widthOfTextAtSize(text, --currentSize)
  }

  return currentSize
}

module.exports = generatePdf;
