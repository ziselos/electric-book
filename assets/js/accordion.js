"use strict";

console.log('Debugging accordions.js');

// --------------------------------------------------------------
// Options
// 
// 1. Use CSS selectors to list the headings that will
//    define each accordion section, e.g. '#content h2'
var accordionHeads = '#content h2'
// 2. Which heading's section should we show by default?
var defaultAccordionHead = '#content h2:first-of-type'
// --------------------------------------------------------------

function ebAccordionInit() {
    return navigator.userAgent.indexOf('Opera Mini') === -1 &&
        'querySelectorAll' in document &&
        'addEventListener' in window &&
        !!Array.prototype.forEach;
}

function ebAccordionSetUpSections(collapserButtons) {

    if (!document.querySelector(accordionHeads)) return;

    // Give the default accordion section an id, if it's set
    if (defaultAccordionHead != '') {
        if (document.querySelector(defaultAccordionHead)) {
            document.querySelector(defaultAccordionHead).id = 'defaultAccordionSection';
        }
    }

    // add role="tablist" to the parent of the role="tab"s
    var content = document.querySelector('#content');
    content.setAttribute('role', 'tablist');

    // loop through collapserButtons
    collapserButtons.forEach(function(collapserButton) {

        // make a section to move the collapsing content into
        var section = document.createElement('section');
        section.setAttribute('role', 'tabpanel');
        section.setAttribute('aria-labelledby', collapserButton.id);
        section.setAttribute('data-accordion-container', collapserButton.id);

        // add the section to the doc
        content.insertBefore(section, collapserButton);


        // make a header, add it to the section
        var header = document.createElement('header');

        //  move the toggle to the header
        header.appendChild(collapserButton);

        // make a link for this id
        var accordionLink = document.createElement('a');
        accordionLink.href = '#' + collapserButton.id;
        accordionLink.innerHTML = collapserButton.innerHTML;

        // Add the link inside the toggle
        collapserButton.innerHTML = accordionLink.outerHTML;
        collapserButton.setAttribute('role', 'tab');

        // add the header to the section
        section.appendChild(header);


        // make a div for the rest of the contents
        var container = document.createElement('div');
        container.setAttribute('data-container', true);

        // add it to the section
        section.appendChild(container);
    });
}

function ebAccordionFillSections() {
    // grab the individual #contents elements of the page
    var contentItems = document.querySelectorAll('#content > *');

    var currentSection = false;
    // loop through it
    contentItems.forEach(function(contentItem) {

        // if this is a section, update currentSection, then move on
        if (contentItem.getAttribute('role') === 'tabpanel') {
            currentSection = contentItem;
            return;
        }

        // have we reached the first section yet? if not, move on
        if (!currentSection) return;

        // otherwise, move it inside the currentSection's data-container
        currentSection.querySelector('[data-container]')
                      .appendChild(contentItem);
    });
}

function ebMoveThemeKeys() {
    // get the theme keys and the theme key links
    var themeKeys = document.querySelectorAll('.theme-key');
    var themeKeysLinks = document.querySelectorAll('.theme-key a');

    themeKeysLinks.forEach(function(themeKeysLink) {
        // up to themeKeys div, up to data-container, up to section,
        // on to next section, down to heading, down to h2
        themeKeysLink.parentNode.parentNode.parentNode
                     .nextElementSibling.firstChild.firstChild
                     .appendChild(themeKeysLink);
    })

    // remove now empty theme keys divs
    themeKeys.forEach(function(themeKey) {
        themeKey.parentNode.removeChild(themeKey);
    })
}

function ebAccordionHideAll() {
    var tabPanels = document.querySelectorAll('[role="tabpanel"]');
    tabPanels.forEach(function(current) {
        current.querySelector('[role="tab"]')
               .setAttribute('data-accordion', 'closed');
        current.querySelector('[data-container]')
               .setAttribute('aria-expanded', 'false');
    });
}

function ebAccordionHideAllExceptThisOne(targetID) {

    console.log('Starting ebAccordionHideAllExceptThisOne...');

    var tabPanels = document.querySelectorAll('[role="tabpanel"]');
    tabPanels.forEach(function(tabPanel) {
        // if it's the one we just clicked, skip it
        if(tabPanel.getAttribute('aria-labelledby') === targetID) return;

        // otherwise, hide it
        tabPanel.querySelector('[role="tab"]')
               .setAttribute('data-accordion', 'closed');
        tabPanel.querySelector('[data-container]')
               .setAttribute('aria-expanded', 'false');
    });
}

function ebAccordionCheckParent(node) {

    if(node != null) {
        console.log('Checking for parent element of "' + node.innerText.substring(0, 20) + '..."');
    }

    // if there is no parent, or something went wrong, exit
    if(!node) return false;
    if(!node.parentNode) return false;
    if(node.tagName == "BODY") {

        console.log('Parent node is the body element. We\'re done looking.');

        return false;
    }

    var nodeParent = node.parentNode;

    console.log('nodeParent is "' + nodeParent.innerText.substring(0,20) + '..."');

    var parentAttribute = nodeParent.getAttribute('data-accordion-container');

    // if there's a parent, check if it's got data-accordion-container
    // and return that value, which is copied from the id of the section heading
    if(parentAttribute) {
        return nodeParent.getAttribute('data-accordion-container');
    } else {
        console.log('Parent node of "' + node.innerText.substring(0,20) + '..." is not an accordion section');
    }

    return ebAccordionCheckParent(nodeParent);
}

// find and return containing section
// (the aria-labelledby attribute matches the ID)
function ebAccordionFindSection(targetToCheck) {

    if(targetToCheck != null) {
        console.log('Finding section that contains: ' + targetToCheck.outerHTML.substring(0,80));
    }

    // work recursively up the DOM looking for the section
    return ebAccordionCheckParent(targetToCheck);
}

function ebWhichTarget(targetID) {

    console.log('Starting ebWhichTarget...');

    var targetToCheck;

    // if we're given an ID, use it
    if(targetID) {
        console.log('Using targetID ' + targetID);

        // Decode the targetID URI in case it's not ASCII
        console.log('targetID encoded: ' + targetID);
        var targetID = decodeURIComponent(targetID);
        console.log('targetID decoded: ' + targetID);

        targetToCheck = document.getElementById(targetID);
    } else {
        // else use the hash
        var trimmedHash = window.location.hash.replace('#', '');

        // Decode the trimmedHash in case it's not ASCII
        console.log('Using trimmedHash; encoded: ' + trimmedHash);
        var trimmedHash = decodeURIComponent(trimmedHash);
        console.log('using trimmedHash; decoded: ' + trimmedHash);

        targetToCheck = document.getElementById(trimmedHash);
    }


    // if the ID doesn't exist, exit
    if(!targetToCheck) {
        return false;
    }

    return targetToCheck;
}

function ebAccordionShow(targetID) {

    console.log('Starting ebAccordionShow...');
    console.log('ebAccordionShow\'s targetID is: ' + targetID);

    var targetToCheck = ebWhichTarget(targetID);
    if (!targetToCheck) return;

    var sectionID = ebAccordionFindSection(targetToCheck);
    // if there's a section to show
    if (!sectionID) return;

    // set the accordion, then work down to toggle and content div
    var sectionTarget = '[aria-labelledby="' + sectionID +'"]';
    var sectionToShow = document.querySelector(sectionTarget);

    // update the tab
    var tab = sectionToShow.querySelector('[role="tab"]');
    tab.setAttribute('data-accordion', 'open')

    // update the tab contents
    var tabContents = sectionToShow.querySelector('[data-container]');
    tabContents.setAttribute('aria-expanded', 'true');

    // lazyload the images inside
    var lazyimages = sectionToShow.querySelectorAll('[data-srcset]');
    console.log('lazyimages: ' + lazyimages.innerHTML);
    if (lazyimages.innerHTML != undefined) {
        ebLazyLoadImages(lazyimages);
    }

    // if we have a slideline in this section, check if it's a portrait one
    var slidelinesInThisSection = sectionToShow.querySelectorAll('.slides');

    slidelinesInThisSection.forEach(function(slidelineInThisSection) {
        var firstFigureImg = slidelineInThisSection.querySelector('.figure img');

        if (firstFigureImg) {
            firstFigureImg.addEventListener('load', function() {
                var portraitSlideline = (firstFigureImg.height > firstFigureImg.width);
                if(portraitSlideline) {
                    slidelineInThisSection.querySelector('nav').classList.add('nav-slides-portrait');
                }
            })
        };
    })

    if(typeof(videoShow) === 'function') {
        videoShow(sectionToShow);
    }
}

function ebAccordionListenForAnchorClicks() {

    console.log('Starting ebAccordionListenForAnchorClicks...');

    // listen for clicks on *all* the anchors (;_;)
    var allTheAnchors = document.querySelectorAll('#content a');
    allTheAnchors.forEach(function(oneOfTheAnchors) {

        // if it's an external link, exit
        if(oneOfTheAnchors.target === '_blank') return;

        oneOfTheAnchors.addEventListener("click", function(ev) {

            ev.stopPropagation();

            // ignore target blank / rel noopener links
            if(this.getAttribute('rel') === 'noopener') return;

            // get the target ID by removing any file path and the #
            if(this.hasAttribute('href')) {
                var targetID = this.getAttribute('href').replace(/.*#/, '');
                console.log('The targetID is: ' + targetID);
            } else {
                return;
            }
            // if it's an open accordion, close it
            if(this.parentNode.getAttribute('data-accordion') === 'open') {
                ebAccordionHideAll();
                return;
            }

            // did we click on a thing that wasn't an accordion?
            // which section / accordion is it inside?
            if(!this.parentNode.getAttribute('data-accordion')) {

                console.log('We clicked on something that is not an accordion. Now to find targetID ' + targetID + ' in the DOM...');

                // find the target of the link in the DOM
                var targetOfLink = document.getElementById(targetID);
                // recursively update targetID until we have a data-accordion
                targetID = ebAccordionFindSection(targetOfLink);
            }

            // now open the right closed accordion
            ebAccordionShow(targetID);
            ebAccordionHideAllExceptThisOne(targetID);
        })
    })
}

function ebAccordionListenForHeadingClicks() {
    // also listen for heading clicks
    var allTheToggleHeaders = document.querySelectorAll('[data-accordion]');
    allTheToggleHeaders.forEach(function(oneOfTheToggleHeaders) {
        oneOfTheToggleHeaders.addEventListener("click", function() {
            // simulate anchor click
            this.querySelector('a').click();
        })
    })
}

function ebAccordionListenForNavClicks() {
    // also listen for nav clicks
    var navLinks = document.querySelectorAll('#nav [href]');
    navLinks.forEach(function(navLink) {
        navLink.addEventListener("click", function() {
            // get the section and click to open it if it's closed
            var theSection = document.getElementById(this.hash.replace(/.*#/, ''));
            // simulate anchor click, if it's closed
            if(theSection) {
                if(theSection.getAttribute('data-accordion') === 'closed') {
                    theSection.querySelector('a').click();
                }
            }
        })
    })
}

function ebAccordionListenForHashChange() {

    console.log('Starting ebAccordionListenForHashChange...');

    window.addEventListener("hashchange", function() {
        // get the target ID from the hash
        var targetID = window.location.hash;
        console.log('targetID encoded: ' + targetID);
        var targetID = decodeURIComponent(targetID);
        console.log('targetID decoded: ' + targetID);
        // get the target of the link
        var targetOfLink = document.getElementById(targetID.replace(/.*#/, ''));
        console.log('targetOfLink: ' + targetOfLink.innerHTML);

        // check if it's in the viewport already
        var targetRect = targetOfLink.getBoundingClientRect();
        var targetInViewport = targetRect.top >= - targetRect.height
                            && targetRect.left >= - targetRect.width
                            && targetRect.bottom <= targetRect.height + window.innerHeight
                            && targetRect.right <= targetRect.width + window.innerWidth;

        // check if it's an accordion
        var targetAccordionStatus = targetOfLink.getAttribute('data-accordion');

        // if it's in the viewport and it's not an accordion, then exit
        if(targetInViewport && !targetAccordionStatus) return;

        // if it's an accordion and it's closed, open it / jump to it
        if(targetAccordionStatus === 'closed') {
            targetOfLink.querySelector('a').click();
            return;
        }

        // otherwise, open the appropriate accordion
        var targetAccordionID = ebAccordionFindSection(targetOfLink);

        ebAccordionShow(targetAccordionID);
        ebAccordionHideAllExceptThisOne(targetAccordionID);
    });
}

function ebAccordify() {
    // early exit for older browsers
    if (!ebAccordionInit()) return;

    // exit if there aren't any headings
    var collapserTargets = accordionHeads;
    var collapserButtons = document.querySelectorAll(collapserTargets);
    if (!collapserButtons) return;

    // exit if this isn't a chapter
    var thisIsNotAChapter = (document.querySelector('body').getAttribute('class').indexOf('chapter') === -1);
    var thisHasNoH2s = (document.querySelector(accordionHeads) === null);
    var thisIsEndmatter = (document.querySelector('body').getAttribute('class').indexOf('endmatter') !== -1);
    if(thisIsNotAChapter || thisHasNoH2s || thisIsEndmatter) return;

    ebAccordionSetUpSections(collapserButtons);
    ebAccordionFillSections();
    ebMoveThemeKeys();

    if(searchTerm) {
        // loop through sections
        var accordionSections = document.querySelectorAll('section[data-accordion-container]');
        accordionSections.forEach(function(accordionSection) {

            // check for any markjs marks
            var searchTermsInSection = accordionSection.querySelectorAll('[data-markjs]');
            var numberOfSearchTermsInSection = searchTermsInSection.length;

            // mark the sections that have the search term inside
            if(!!numberOfSearchTermsInSection) {
                var sectionHeaderLink = accordionSection.querySelector('header a');
                sectionHeaderLink.innerHTML = '<mark>' + sectionHeaderLink.innerHTML + '</mark>';

                // add a mini-summary paragraph
                var searchResultsMiniSummary = document.createElement('p');
                searchResultsMiniSummary.innerHTML = numberOfSearchTermsInSection + ' search results for ' + '"<mark>' + searchTerm + '</mark>"';
                accordionSection.querySelector('header').appendChild(searchResultsMiniSummary);
            }
        });

        // add a summary before the first section
        var searchTerms = document.querySelectorAll('[data-markjs]');
        var numberOfSearchTerms = searchTerms.length;
        if(!!numberOfSearchTerms) {
            // make the summary paragraph
            var searchResultsSummary = document.createElement('p');
            searchResultsSummary.classList.add('search-results-summary')
            searchResultsSummary.innerHTML = numberOfSearchTerms + ' search results for ' + '"<mark>' + searchTerm + '</mark>".';

            // add it after the main heading
            var mainHeading = document.querySelector('h1');
            var contentDiv =  document.querySelector('#content');

            contentDiv.insertBefore(searchResultsSummary, mainHeading.nextSibling);

            // add a link to the first result
            searchTerms[0].id = 'first-search-result';
            searchResultsSummary.innerHTML += ' <a href="#first-search-result">Jump to first result &darr;</a>.'
        }
    }

    // if there's no hash, show the first section
    // else (there is a hash, so) show that section
    if(!window.location.hash) {
        ebAccordionHideAllExceptThisOne('defaultAccordionSection');
        ebAccordionShow('defaultAccordionSection');
        return;
    }

    ebAccordionHideAll();
    ebAccordionShow();
}

ebAccordify();
ebAccordionListenForAnchorClicks();
ebAccordionListenForHeadingClicks();
ebAccordionListenForNavClicks();
ebAccordionListenForHashChange();
