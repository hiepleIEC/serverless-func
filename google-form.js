require('dotenv').config()
const { getForm } = require('./drive')
;(async () => {
  // create folder
  const FormApp = await getForm()
  const form = await FormApp.forms.create()
  var item = await form.addCheckboxItem()
  await item.setTitle('What condiments would you like on your hot dog?')
  await item.setChoices([
    item.createChoice('Ketchup'),
    item.createChoice('Mustard'),
    item.createChoice('Relish'),
  ])
  await form
    .addMultipleChoiceItem()
    .setTitle('Do you prefer cats or dogs?')
    .setChoiceValues(['Cats', 'Dogs'])
    .showOtherOption(true)
  await form.addPageBreakItem().setTitle('Getting to know you')
  await form.addDateItem().setTitle('When were you born?')
  await form
    .addGridItem()
    .setTitle('Rate your interests')
    .setRows(['Cars', 'Computers', 'Celebrities'])
    .setColumns(['Boring', 'So-so', 'Interesting'])
  console.log('Published URL: ' + form.getPublishedUrl())
  console.log('Editor URL: ' + form.getEditUrl())
})()
