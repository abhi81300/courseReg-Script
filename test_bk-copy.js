const express = require('express');
const puppeteer = require('puppeteer');
const http = require('http');
const WebSocket = require('ws');





(async () => {
  console.log('Before launching Puppeteer');
  const browser = await puppeteer.launch({ headless: false,defaultViewport:false,args: ['--no-sandbox'] });
  console.log('After launching Puppeteer');
  const page = await browser.newPage();
  await page.setDefaultTimeout(0);
  await page.goto('https://cumsdtu.in/registration_student/login/login.jsp?courseRegistration', {
    waitUntil: 'domcontentloaded',
  });
  var name = "<Change to u r Name>"
  var id = "<U r roll no.>"
  var pass = "<U r Pass>"
  await page.waitForSelector('#usernameId');
  await page.waitForSelector('#passwordId');
  await page.type('#usernameId', id);
  await page.type('#passwordId', pass);
  await page.waitForSelector('#submitButton');
  await Promise.all([page.waitForNavigation(), page.click('#submitButton')]);

  var _startflag = true;

  const check = await page.evaluate(() => {
    let error = document.querySelector("#errorLbl");
    return error ? error.textContent : null;
  });
  
  if (check !== null) {
    console.log(`${check}`);
    _startflag = false;
    await browser.close();
  }
  console.log("Ready")
  async function searchForLoader(classname, click = false, clrchange = false) {
    while (true) {
      const found = await page.evaluate((classname, click, clrchange) => {
        const loaderElement = document.querySelector(classname);
        if (loaderElement) {
          console.log(`Found element ${classname}`);
  
          if (click) {
            console.log(`Clicking on element ${classname}`);
            loaderElement.click();
          }
  
          if (clrchange) {
            console.log(`Changing color of element ${classname}`);
            loaderElement.style.backgroundColor = "yellow";
          }
  
          return true;
        }
        return false;
      }, classname, click, clrchange);
  
      if (found) {
        console.log(`Successfully interacted with element ${classname}`);
        return true;
      }
  
      // Wait for a while before checking again (adjust the delay as needed)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  


  async function searchForElementWithAttribute(attribute, attributeValue, clrchange = false) {
    while (true) {
      const found = await page.evaluate((attribute, attributeValue, clrchange) => {
        const elements = document.querySelectorAll(`[${attribute}="${attributeValue}"]`);
        if (clrchange) {
          elements.forEach(element => {
            // Change the style for each matching element
            element.style.backgroundColor = "yellow";
          });
        }
        return elements.length > 0;
      }, attribute, attributeValue, clrchange);
  
      if (found) {
        console.log(`Found element with ${attribute}="${attributeValue}"`);
        return true;
      }
  
      // Wait for a while before checking again (adjust the delay as needed)
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  


  // Replace with the text you are looking for

  async function searchForText(specificText, click = false) {
    while (true) {
      try {
        const found = await page.evaluate(async (specificText, click) => {
          // Use a selector to find all elements on the page
          const allElements = document.querySelectorAll('*');
  
          // Check each element's textContent for the specific text
          for (const element of allElements) {
            if (element.textContent.trim() === specificText) {
              element.parentElement.style.backgroundColor = 'yellow';
              if (click) {
                element.click();
              }
              return true;
            }
          }
  
          return false;
        }, specificText, click);
  
        if (found) {
          console.log(`\x1b[32m`, `Found the textContent: ${specificText}`);
          return true;
        }
  
        // Wait for a while before checking again (adjust the delay as needed)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('==>Error in Searching Text');
        // Optionally, you can add more specific error handling here
        break;
      }
    }
  }


  async function searchForChild(specificText, click = false) {
    while (true) {
      try {
        const found = await page.evaluate(async (specificText, click) => {
          // Find the "Selected Courses" div
          const selectedCoursesDiv = document.querySelector('div:contains("Selected Courses:")');
  
          if (selectedCoursesDiv) {
            selectedCoursesDiv.style.backgroundColor = 'yellow';
  
            // Log text content of the child elements
            const childDivs = selectedCoursesDiv.querySelectorAll('div');
            for (let i = 0; i < childDivs.length; i++) {
              const childTextContent = childDivs[i].textContent.trim();
              console.log(`Child[${i}] Text Content: ${childTextContent}`);
            }
  
            if (click) {
              // Perform click action if needed
              // childDivs[0].click(); // Click on the first child, adjust as needed
            }
            return true;
          }
  
          return false;
        }, specificText, click);
  
        if (found) {
          console.log(`\x1b[32m`, `Found the textContent: ${specificText}`);
          return true;
        }
  
        // Wait for a while before checking again (adjust the delay as needed)
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error('==>Error in Searching Text');
        // Optionally, you can add more specific error handling here
        break;
      }
    }
  }
  let uniqueChildTextContentArray = [];

  async function logChildTextContent() {
    try {
      // Find the div with the text "Selected Courses:"
      const selectedCoursesDiv = await page.waitForXPath('//div[contains(text(), "Selected Courses:")]');
  
      if (!selectedCoursesDiv) {
        console.error('Div with text "Selected Courses:" not found.');
        return;
      }
  
      // Highlight the "Selected Courses:" div
      if (selectedCoursesDiv) {
        await selectedCoursesDiv.evaluate(element => {
          if (element) {
            element.style.backgroundColor = 'yellow';
          }
        });
      }
  
      // Find the common ancestor div of "Selected Courses:" and "compulsoryCourses" divs
      const commonAncestorDiv = await page.evaluateHandle(selectedCoursesDiv => {
        const selectedCoursesParent = selectedCoursesDiv.parentElement;
        const compulsoryCoursesDivs = Array.from(document.querySelectorAll('.compulsoryCourses'));
  
        for (const compulsoryCoursesDiv of compulsoryCoursesDivs) {
          if (selectedCoursesParent.contains(compulsoryCoursesDiv)) {
            return selectedCoursesParent;
          }
        }
  
        return null;
      }, selectedCoursesDiv);
  
      if (!commonAncestorDiv) {
        console.error('Common ancestor div not found.');
        return;
      }
  
      // Highlight the common ancestor div
      if (commonAncestorDiv) {
        await commonAncestorDiv.evaluate(element => {
          if (element) {
            element.style.backgroundColor = 'yellow';
          }
        });
      }
  
      var uniqueChildTextContentSet = new Set();
  
      // Find all child divs within the common ancestor div
      const childDivs = await page.$$eval('.compulsoryCourses', elements => elements.map(element => element.textContent.trim()));
  
      // Loop through each child div and log its text content
      for (let i = 0; i < childDivs.length; i++) {
        const childTextContent = childDivs[i];
        uniqueChildTextContentSet.add(childTextContent);
        console.log(`Selected Courses[${i + 1}] : ${childTextContent}`);
      }
  
      uniqueChildTextContentArray = Array.from(uniqueChildTextContentSet);
    } catch (error) {
      console.error('Error logging child text content:', error.message);
    } finally {
      console.log(uniqueChildTextContentArray);
    }
  }
  
  let Subs = ['AE322 Cr:4.0', 'MOOC302 Cr:2.0 ', 'AE302 Cr:4.0', 'AE304 Cr:4.0' , 'ALTERNATIVE FUELS & ENERGY SYSTEMS'];
  //const course_title = ['DATA STRUCTURES' , 'SOFTWARE ENGINEERING' , 'MECHANICS OF SOLIDS' , 'METHODS FOR DATA ANALYSIS']
  var subscount = 0;
  var _arraycmprflag = false;
  var _selectedcourses = []
  let extractedSubs = Subs.map(item => item.split(' ')[0]);
  let arrequalcheck = false

  // Call the function to start searching
  async function executeInSequence() {
    let breakflag = false;
    while (true) {
      if (_startflag === true) {
        
      
          console.log('Starting');
          if (_arraycmprflag === true) {
            const removedIndices = [];
            Subs = Subs.filter((item, index) => {
              if (uniqueChildTextContentArray.includes(item)) {
                removedIndices.push(index);
                return false; // Remove the element from Subs
              }
              return true;
            });
      
            // Remove corresponding elements from course_title
            removedIndices.forEach(index => {
              course_title.splice(index, 1);
            });
      
            console.log(`New Subs array: ${Subs}`);
            console.log(`New course_title array: ${course_title}`);
            
          }
          if (arrequalcheck === true) {
            const allElementsInAr1 = extractedSubs.every(element => uniqueChildTextContentArray.includes(element));
            if (allElementsInAr1) {
              console.log("found all elements");
              break;
            }
          }
    const result1 = await searchForText(`${name.toUpperCase()}(${id.toUpperCase()})`);
    console.log(`${name.toUpperCase()}(${id.toUpperCase()})`)
    while (subscount < Subs.length) {
      if (result1) {
        const result2 = await searchForText(Subs[subscount].trim(), true);
        if (result2) {
          const result3 = true //await searchForElementWithAttribute('ng-reflect-value', course_title[subscount].trim() , true);
          if (result3){
          console.log(`\x1b[34m`,"Waiting for Register Button");
          await searchForLoader('.narrow .mat-button .mat-save', true, true);
          while (true) {
            await logChildTextContent()
            if (!uniqueChildTextContentArray.includes(extractedSubs[subscount].trim())) {
              await new Promise(resolve => setTimeout(resolve, 500));
              if (uniqueChildTextContentArray.length === 0) {
                break;
              }
            console.log(`Index ${subscount} not found in uniqueChildTextContentArray`);
          }
            else{
              console.log(`Index ${subscount} [${extractedSubs[subscount]}] found in uniqueChildTextContentArray`);
              break;
            }
            
          }
          subscount = subscount + 1;
            continue  
          
          }
        }
      } else {
        console.log("error Occured Name not Found, Restart")
        breakflag = true;
        break;  // Exit the loop if result1 is not true
      }
    }
    await logChildTextContent();
    // const allElementsInAr1 = extractedSubs.every(element => uniqueChildTextContentArray.includes(element));
    // console.log(allElementsInAr1)
    console.log('Restarting Again');
    //res.send(`Page Title: ${uniqueChildTextContentArray}`);
    //await new Promise(resolve => setTimeout(resolve, 200));
    await new Promise(resolve => setTimeout(resolve, 500));
    subscount = 0;
    _arraycmprflag = true;
    arrequalcheck = true;
    if (breakflag === true) {
      break;
    }
    // const allElementsInAr1 = extractedSubs.every(element => uniqueChildTextContentArray.includes(element));
    // if (allElementsInAr1) {
    //   break;
    // }
  }

  else{
    break;
  }
    }
  }
  
  // Call the function to start execution
  
  // executeInSequence();
  
  
  executeInSequence();


})();








