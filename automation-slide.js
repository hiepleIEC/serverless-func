const NAME = 'Automation slide with AppScript';
const deck = SlidesApp.create(NAME);
const PAGEWIDTH = deck.getPageWidth();
const PAGEHEIGHT = deck.getPageHeight();
const DEFAULT_WIDTH_VIDEO = 144;
const DEFAULT_HEIGHT_VIDEO = 108;
const NUMBER_VIDEO_PER_LINE = 4;
const doGet = (e) => {
  const { games, networks } = readDataFromSheet();
  const [title] = deck.getSlides()[0].getPageElements();
  title.asShape().getText().setText("Report By Network");
  renderSlideFromData(networks, 'network');
  const shape = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK).insertTextBox("Report By Game", PAGEWIDTH / 2 - 150, PAGEHEIGHT / 2 - 50, 350, 350);
  shape.getText().getTextStyle().setFontSize(45);
  renderSlideFromData(games, 'game');
  return ContentService.createTextOutput(deck.getUrl());
}
const renderSlideFromData = (data, reportType) => {
  for (const key in data) {
    const name = key;
    const values = data[key];
    const type = values[0].type;
    let slide = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
    let newX = null;
    let newY = null;
    // calculate width for space
    const { lineMapWidthForSpace, batchLinksByLine } = calculateSpaceForWidth(values);
    // end calculate width for space  
    // calculate height for space
    const heightSpaceForEachLine = calculateSpaceForHeight(batchLinksByLine.length >= 2 ? 2 : batchLinksByLine.length);
    // end calculate height for space      
    for (let i = 0; i < values.length; i++) {
      const line = Math.floor((i / NUMBER_VIDEO_PER_LINE));
      const contentTitle = reportType === 'game' && key === 'LTV testing' ? type : `${name} - ${type}`;
      if (i !== 0 && i % 8 === 0) {// case > 8 video per slide
        slide = deck.appendSlide(SlidesApp.PredefinedLayout.BLANK);
        slide.insertTextBox(contentTitle)
          .setLeft(10)
          .setTop(20)
          .setContentAlignment(SlidesApp.ContentAlignment.TOP)
          .setWidth(250)
        newX = lineMapWidthForSpace[line];
        newY = heightSpaceForEachLine;
      }
      else {
        if (i % NUMBER_VIDEO_PER_LINE === 0 && i !== 0 && i % 8 !== 0) {
          newX = lineMapWidthForSpace[line];
          newY += (DEFAULT_HEIGHT_VIDEO + heightSpaceForEachLine);
        }
        else if (i === 0) {
          newX = lineMapWidthForSpace[line];
          newY = heightSpaceForEachLine;
          slide.insertTextBox(contentTitle)
            .setLeft(10)
            .setTop(20)
            .setContentAlignment(SlidesApp.ContentAlignment.TOP)
            .setWidth(250)

        }
        else newX += (lineMapWidthForSpace[line] + DEFAULT_WIDTH_VIDEO);
      }
      const isYoutubeType = values[i].youtubeLink && processLinkYoutube(slide, values[i].youtubeLink);
      const video = isYoutubeType ? slide.insertVideo(values[i].youtubeLink) : slide.insertTextBox(processLinkDropbox(values[i].dropboxLink));
      const contentVideoName = values[i].videoName;
      if (isYoutubeType) {
        video.scaleHeight(0.4);
        video.scaleWidth(0.4);
      }
      else {
        video.setWidth(144).setHeight(108);
        video.getText().getTextStyle().setFontSize(12).setLinkUrl(values[i].dropboxLink)
      }
      video.setLeft(newX).setTop(newY);
      const shapeVideoName = slide.insertTextBox(contentVideoName)
        .setLeft(newX + 20)
        .setTop(newY + 100)
        .setContentAlignment(SlidesApp.ContentAlignment.TOP)
      shapeVideoName.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER).setSpaceBelow(5)
      shapeVideoName.getText().getTextStyle().setFontSize(8);

      const distanceDes = reportType === 'game' ? newY + 140 : newY + 150;

      let shapeDescription = null;
      if (reportType === 'game') {
        // set style cpi
        if (values[i].cpi) {
          shapeDescription = slide.insertTextBox(values[i].cpi)
            .setLeft(newX + 10)
            .setTop(distanceDes)
            .setContentAlignment(SlidesApp.ContentAlignment.TOP)
          shapeDescription.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER).setSpaceBelow(5);
          shapeDescription.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER).setSpaceBelow(5);
          shapeDescription.getText().getTextStyle().setFontSize(10).setBold(true);
        }

        // set style CIP-ref  
        if (values[i].cpiRef) {
          const contentCpiRef = values[i].cpiRef && values[i].cpi ? ` - ${values[i].cpiRef}` : values[i].cpiRef;
          shapeDescription = slide.insertTextBox(contentCpiRef)
            .setLeft(newX + 33)
            .setTop(distanceDes)
            .setContentAlignment(SlidesApp.ContentAlignment.TOP)
          shapeDescription.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER).setSpaceBelow(5);
          shapeDescription.getText().getTextStyle().setFontSize(10).setBold(true)
            .setForegroundColor(255, 0, 0);
        }
      }
      else {
        shapeDescription = slide.insertTextBox(values[i].networkName)
          .setLeft(newX + 20)
          .setTop(distanceDes)
          .setContentAlignment(SlidesApp.ContentAlignment.TOP)
        shapeDescription.getText().getParagraphStyle().setParagraphAlignment(SlidesApp.ParagraphAlignment.CENTER).setSpaceBelow(5);
        shapeDescription.getText().getTextStyle().setFontSize(10).setBold(true).setForegroundColor(255, 0, 0)
      }
    }
  }
}
const calculateSpaceForWidth = (data) => {
  const NUMBER_LINES = Math.ceil(data.length / NUMBER_VIDEO_PER_LINE);
  const batchLinksByLine = [];
  for (let i = 0; i < NUMBER_LINES; i++) {
    batchLinksByLine.push([]);
  };
  for (let i = 0; i < data.length; i++) {
    const video = 'https://youtube.com/shorts/pLHMLyHm4Fo';
    const indexBatch = (Math.floor((i / NUMBER_VIDEO_PER_LINE)));
    batchLinksByLine[indexBatch].push(video);
  };
  const lineMapWidthForSpace = {};
  for (let i = 0; i < batchLinksByLine.length; i++) {
    const el = batchLinksByLine[i];
    const totalWidthContent = DEFAULT_WIDTH_VIDEO * el.length;
    const totalWidthSpace = PAGEWIDTH - totalWidthContent;
    const numberSpace = el.length + 1;
    const widthForSpace = totalWidthSpace / numberSpace;
    lineMapWidthForSpace[i] = widthForSpace;
  }
  return { lineMapWidthForSpace, batchLinksByLine };
};
const calculateSpaceForHeight = (totalLine) => {
  const totalHeightContent = DEFAULT_HEIGHT_VIDEO * totalLine;
  const totalHeightForSpace = PAGEHEIGHT - totalHeightContent;
  return totalHeightForSpace / (totalLine + 1);
};
const readDataFromSheet = () => {
  const valuesByNetwork = getDataFromSheet('By Network');
  const valuesByGame = getDataFromSheet('By Game');
  const rawDataByNetwork = [];
  const rawDataByGame = [];
  for (let row = 2; row < valuesByNetwork.length; row++) {
    const [game, type, networkName, platform, videoName, youtubeLink, dropboxLink] = valuesByNetwork[row];
    rawDataByNetwork.push({ game, type, networkName, platform, videoName, youtubeLink, dropboxLink });
  };
  for (let row = 2; row < valuesByGame.length; row++) {
    const [game, type, videoName, cpi, cpiRef, youtubeLink, dropboxLink] = valuesByGame[row];
    rawDataByGame.push({ game, type, videoName, cpi, cpiRef, youtubeLink, dropboxLink });
  };
  const objDataNetwork = renderObjectData(rawDataByNetwork);
  const objDataGame = renderObjectData(rawDataByGame, 'game');
  return {
    networks: objDataNetwork,
    games: objDataGame
  }
};
const getDataFromSheet = (sheetName) => SpreadsheetApp.openById('1tvw0cDUBeXk0F-0ntOnvDJRmb9AMcc2xexmYVsuCXxU').getSheetByName(sheetName).getDataRange().getValues();
const renderObjectData = (rawData, type) => rawData.reduce((acc, el) => {
  if (el.game in acc) {
    acc[el.game].push(el);
  }
  else if (el.type === 'LTV testing' && type === 'game') {
    if ('LTV testing' in acc) acc['LTV testing'].push(el);
    else acc['LTV testing'] = [el];
  }
  else acc[el.game] = [el];
  return acc;
}, {});

const processLinkDropbox = (link) => {
  const linkArr = link.split("/");
  const videoName = linkArr[linkArr.length - 1].replace(".mp4", "").replace("?dl=0", "");
  return decodeURIComponent(videoName);
};


const processLinkYoutube = (slide, link) => {
  try {
    slide.insertVideo(link).remove();
    return true;
  }
  catch (e) {
    return false;
  }
};
