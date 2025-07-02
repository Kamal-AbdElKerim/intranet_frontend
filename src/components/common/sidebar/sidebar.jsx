import {  Fragment, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { MENUITEMS } from './sidemenu/sidemenu';
import { ThemeChanger } from '../../../redux/action';
import store from '../../../redux/store';
import logo from "../../../assets/images/brand-logos/logo.png";
import SimpleBar from 'simplebar-react';
import Menuloop from '../../ui/menuloop';

import '../../../assets/css/logo-animation.css';


const Sidebar = ({ local_varaiable, ThemeChanger }) => {
  const [menuitems, setMenuitems] = useState(MENUITEMS);
  const location = useLocation();

  // Filter menu items based on section
  function filterMenuItems(menuItems, section) {
    return menuItems.filter(item => {
      if (item.menutitle) return true; // Always keep section titles
      if (!item.path) return false; // Skip items without a path
      if (section === 'DemandesAdministratives') {
        return item.path.includes('DemandesAdministratives');
      }
      if (section === 'Pmo') {
        return item.path.includes('Pmo');
      }
      return true; // Default: show all
    });
  }

  let section = null;
  if (location.pathname.includes('/DemandesAdministratives')) {
    section = 'DemandesAdministratives';
  } else if (location.pathname.includes('/Pmo')) {
    section = 'Pmo';
  }

  const filteredMenuItems = filterMenuItems(MENUITEMS, section);

  function closeMenuFn() {
    const closeMenuRecursively = (items) => {
      items?.forEach((item) => {
        item.active = false;
        closeMenuRecursively(item.children);
      });
    };
    closeMenuRecursively(MENUITEMS);
    setMenuitems((arr) => [...arr]);
  }

  useEffect(() => {
    const mainContent = document.querySelector(".main-content");
    if (window.innerWidth <= 992) {
			if (mainContent) {
				const theme = store.getState();
				ThemeChanger({ ...theme, toggled: "close" });
			}
			else if (document.documentElement.getAttribute("data-nav-layout") == "horizontal") {
				closeMenuFn();
			}
		}
    mainContent.addEventListener('click', menuClose);
    window.addEventListener('resize', menuResizeFn);
  }, []);

  // const location = useLocation();


  function Onhover() {
    const theme = store.getState();
    if ((theme.toggled == 'icon-overlay-close' || theme.toggled == 'detached-close') && theme.iconOverlay != 'open') {
      ThemeChanger({ ...theme, "iconOverlay": "open" });
    }
  }
  function Outhover() {
    const theme = store.getState();
    if ((theme.toggled == 'icon-overlay-close' || theme.toggled == 'detached-close') && theme.iconOverlay == 'open') {
      ThemeChanger({ ...theme, "iconOverlay": "" });
    }
  }
  const [MyclassName, setMyClass] = useState("");
  function menuClose() {

    const theme = store.getState();
    if (window.innerWidth <= 992) {
      ThemeChanger({ ...theme, toggled: "close" });
    }
    const overlayElement = document.querySelector("#responsive-overlay");
    if (overlayElement) {

      overlayElement.classList.remove("active");
    }
    if (theme.dataNavLayout == 'horizontal' || theme.dataNavStyle == 'menu-click' || theme.dataNavStyle == 'icon-click') {
      closeMenuFn();
    }

    if (localStorage.getItem("ynexverticalstyles") == "icontext") {
			setMyClass("");
		}
		if (window.innerWidth > 992) {
			if (theme.iconOverlay === "open") {
				ThemeChanger({ ...theme, iconOverlay: "" });
			}
		}

  }

  const WindowPreSize = [window.innerWidth]

  function menuResizeFn() {

    WindowPreSize.push(window.innerWidth);
    if (WindowPreSize.length > 2) { WindowPreSize.shift() }
    const theme = store.getState();
    if (WindowPreSize.length > 1) {
      if ((WindowPreSize[WindowPreSize.length - 1] < 992) && (WindowPreSize[WindowPreSize.length - 2] >= 992)) {
        // less than 992;
        ThemeChanger({ ...theme, toggled: "close" });
      }

      if ((WindowPreSize[WindowPreSize.length - 1] >= 992) && (WindowPreSize[WindowPreSize.length - 2] < 992)) {
        // greater than 992
        ThemeChanger({ ...theme, toggled: theme.dataVerticalStyle == "doublemenu" ? "double-menu-open" : "" });
      }
    }
  }

  function switcherArrowFn() {

    // Used to remove is-expanded class and remove class on clicking arrow buttons
    function slideClick() {
      const slide = document.querySelectorAll(".slide");
      const slideMenu = document.querySelectorAll(".slide-menu");

      slide.forEach((element) => {
        if (element.classList.contains("is-expanded")) {
          element.classList.remove("is-expanded");
        }
      });

      slideMenu.forEach((element) => {
        if (element.classList.contains("open")) {
          element.classList.remove("open");
          element.style.display = "none";
        }
      });
    }

    slideClick();
  }

  function slideRight() {
    const menuNav = document.querySelector(".main-menu");
    const mainContainer1 = document.querySelector(".main-sidebar");

    if (menuNav && mainContainer1) {
      const marginLeftValue = Math.ceil(
        Number(window.getComputedStyle(menuNav).marginInlineStart.split("px")[0])
      );
      const marginRightValue = Math.ceil(
        Number(window.getComputedStyle(menuNav).marginInlineEnd.split("px")[0])
      );
      const check = menuNav.scrollWidth - mainContainer1.offsetWidth;
      let mainContainer1Width = mainContainer1.offsetWidth;

      if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
        if (!(local_varaiable.dataVerticalStyle.dir === "rtl")) {
          if (Math.abs(check) > Math.abs(marginLeftValue)) {
            menuNav.style.marginInlineEnd = "0";

            if (!(Math.abs(check) > Math.abs(marginLeftValue) + mainContainer1Width)) {
              mainContainer1Width = Math.abs(check) - Math.abs(marginLeftValue);
              const slideRightButton = document.querySelector("#slide-right");
              if (slideRightButton) {
                slideRightButton.classList.add("hidden");
              }
            }

            menuNav.style.marginInlineStart =
              (Number(menuNav.style.marginInlineStart.split("px")[0]) -
                Math.abs(mainContainer1Width)) +
              "px";

            const slideRightButton = document.querySelector("#slide-right");
            if (slideRightButton) {
              slideRightButton.classList.remove("hidden");
            }
          }
        } else {
          if (Math.abs(check) > Math.abs(marginRightValue)) {
            menuNav.style.marginInlineEnd = "0";

            if (!(Math.abs(check) > Math.abs(marginRightValue) + mainContainer1Width)) {
              mainContainer1Width = Math.abs(check) - Math.abs(marginRightValue);
              const slideRightButton = document.querySelector("#slide-right");
              if (slideRightButton) {
                slideRightButton.classList.add("hidden");
              }
            }

            menuNav.style.marginInlineStart =
              (Number(menuNav.style.marginInlineStart.split("px")[0]) -
                Math.abs(mainContainer1Width)) +
              "px";

            const slideLeftButton = document.querySelector("#slide-left");
            if (slideLeftButton) {
              slideLeftButton.classList.remove("hidden");
            }
          }
        }
      }

      const element = document.querySelector(".main-menu > .slide.open");
      const element1 = document.querySelector(".main-menu > .slide.open > ul");
      if (element) {
        element.classList.remove("active");
      }
      if (element1) {
        element1.style.display = "none";
      }
    }

    switcherArrowFn();
  }

  function slideLeft() {
    const menuNav = document.querySelector(".main-menu");
    const mainContainer1 = document.querySelector(".main-sidebar");

    if (menuNav && mainContainer1) {
      const marginLeftValue = Math.ceil(
        Number(window.getComputedStyle(menuNav).marginInlineStart.split("px")[0])
      );
      const marginRightValue = Math.ceil(
        Number(window.getComputedStyle(menuNav).marginInlineEnd.split("px")[0])
      );
      const check = menuNav.scrollWidth - mainContainer1.offsetWidth;
      let mainContainer1Width = mainContainer1.offsetWidth;

      if (menuNav.scrollWidth > mainContainer1.offsetWidth) {
        if (!(local_varaiable.dataVerticalStyle.dir === "rtl")) {
          if (Math.abs(check) <= Math.abs(marginLeftValue)) {
            menuNav.style.marginInlineStart = "0px";
          }
        } else {
          if (Math.abs(check) > Math.abs(marginRightValue)) {
            menuNav.style.marginInlineStart = "0";

            if (!(Math.abs(check) > Math.abs(marginRightValue) + mainContainer1Width)) {
              mainContainer1Width = Math.abs(check) - Math.abs(marginRightValue);
              const slideRightButton = document.querySelector("#slide-right");
              if (slideRightButton) {
                slideRightButton.classList.add("hidden");
              }
            }

            menuNav.style.marginInlineStart =
              (Number(menuNav.style.marginInlineStart.split("px")[0]) -
                Math.abs(mainContainer1Width)) +
              "px";

            const slideLeftButton = document.querySelector("#slide-left");
            if (slideLeftButton) {
              slideLeftButton.classList.remove("hidden");
            }
          }
        }
      }

      const element = document.querySelector(".main-menu > .slide.open");
      const element1 = document.querySelector(".main-menu > .slide.open > ul");
      if (element) {
        element.classList.remove("active");
      }
      if (element1) {
        element1.style.display = "none";
      }
    }

    switcherArrowFn();
  }


  const Topup = () => {
    if (window.scrollY > 30 && document.querySelector(".app-sidebar")) {
      const Scolls = document.querySelectorAll(".app-sidebar");
      Scolls.forEach((e) => {
        e.classList.add("sticky-pin");
      });
    } else {
      const Scolls = document.querySelectorAll(".app-sidebar");
      Scolls.forEach((e) => {
        e.classList.remove("sticky-pin");
      });
    }
  };
  window.addEventListener("scroll", Topup);

  const level = 0
  let hasParent = false
  let hasParentLevel = 0

  function setSubmenu(event, targetObject, MENUITEMS = menuitems) {
    const theme = store.getState();
    if ((window.screen.availWidth <= 992 || theme.dataNavStyle != "icon-hover") && (window.screen.availWidth <= 992 || theme.dataNavStyle != "menu-hover")) {
      if (!event?.ctrlKey) {
        for (const item of MENUITEMS) {
          if (item === targetObject) {
            item.active = true;
            item.selected = true;
            // setMenuAncestorsActive(MENUITEMS,item);
            setMenuAncestorsActive(item);
          } else if (!item.active && !item.selected) {
            item.active = false; // Set active to false for items not matching the target
            item.selected = false; // Set active to false for items not matching the target
          } else {
            // removeActiveOtherMenus(MENUITEMS,item);
            removeActiveOtherMenus(item);
          }
          if (item.children && item.children.length > 0) {
            setSubmenu(event, targetObject, item.children);
          }
        }

      }
    }

    setMenuitems((arr) => [...arr]);
  }
  function getParentObject(obj, childObject) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === 'object' && JSON.stringify(obj[key]) === JSON.stringify(childObject)) {
          return obj; // Return the parent object
        }
        if (typeof obj[key] === 'object') {
          const parentObject = getParentObject(obj[key], childObject);
          if (parentObject !== null) {
            return parentObject;
          }
        }
      }
    }
    return null; // Object not found
  }
  function setMenuAncestorsActive(targetObject) {
    const parent = getParentObject(menuitems, targetObject);
    const theme = store.getState();
    if (parent) {
      if (hasParentLevel > 2) {
        hasParent = true;
      }
      parent.active = true;
      parent.selected = true;
      hasParentLevel += 1;
      setMenuAncestorsActive(parent);
    }
   else if (!hasParent) {
      if (theme.dataVerticalStyle == 'doublemenu') {
        // console.log("closee")
        // html.setAttribute('data-toggled', 'double-menu-close');
        ThemeChanger({ ...theme, toggled: "double-menu-close" });
    }
    }
  }
  function removeActiveOtherMenus(item) {
    if (item) {
      if (Array.isArray(item)) {
        for (const val of item) {
          val.active = false;
          val.selected = false;
        }
      }
      item.active = false;
      item.selected = false;

      if (item.children && item.children.length > 0) {
        removeActiveOtherMenus(item.children);
      }
    }
    else {
      return;
    }
  }
  //
  function setMenuUsingUrl(currentPath) {

    hasParent = false;
    hasParentLevel = 1;
    // Check current url and trigger the setSidemenu method to active the menu.
    const setSubmenuRecursively = (items) => {

      items?.forEach((item) => {
        if (item.path == '') { }
        else if (item.path === currentPath) {
          setSubmenu(null, item);
        }
        setSubmenuRecursively(item.children);
      });
    };
    setSubmenuRecursively(MENUITEMS);
  }
 const [previousUrl , setPreviousUrl]= useState('/')

  useEffect(() => {

        // Select the target element
        const targetElement = document.documentElement;

        // Create a MutationObserver instance
        const observer = new MutationObserver(handleAttributeChange);
    
        // Configure the observer to watch for attribute changes
        const config = { attributes: true };
    
        // Start observing the target element
        observer.observe(targetElement, config);
        let currentPath = location.pathname.endsWith("/") ? location.pathname.slice(0, -1) : location.pathname;
        
        if (currentPath !== previousUrl) {
          setMenuUsingUrl(currentPath);
          setPreviousUrl(currentPath)
        }

    // ... the rest of your useEffect code
  }, [location]);

  //
  function toggleSidemenu(event, targetObject, MENUITEMS = menuitems) {
    const theme = store.getState();
    let element = event.target;


    if (( theme.dataNavStyle != "icon-hover" &&  theme.dataNavStyle != "menu-hover") || (window.innerWidth < 992) || (theme.dataNavLayout != "horizontal") && (theme.toggled != "icon-hover-closed" || theme.toggled != "menu-hover-closed")) {
      for (const item of MENUITEMS) {
        if (item === targetObject) {
          if (theme.dataVerticalStyle == 'doublemenu' && item.active) { return }
          item.active = !item.active;

          if (item.active) {
            closeOtherMenus(MENUITEMS, item);
          } else {
            if (theme.dataVerticalStyle == 'doublemenu') {
              ThemeChanger({ ...theme, toggled: "double-menu-close" });
            }
          }
          setAncestorsActive(MENUITEMS, item);

        }
        else if (!item.active) {
          if (theme.dataVerticalStyle != 'doublemenu') {
            item.active = false; // Set active to false for items not matching the target
          }
        }
        if (item.children && item.children.length > 0) {
          toggleSidemenu(event, targetObject, item.children);
        }
      }
      if (targetObject?.children && targetObject.active) {
        if (theme.dataVerticalStyle == 'doublemenu' && theme.toggled != 'double-menu-open') {
          ThemeChanger({ ...theme, toggled: "double-menu-open" });
        }
      }
      if (element && theme.dataNavLayout == 'horizontal' && (theme.dataNavStyle == 'menu-click' || theme.dataNavStyle == 'icon-click')) {
        const listItem = element.closest("li");
        if (listItem) {
          // Find the first sibling <ul> element
          const siblingUL = listItem.querySelector("ul");
          let outterUlWidth = 0;
          let listItemUL = listItem.closest('ul:not(.main-menu)');
          while (listItemUL) {
            listItemUL = listItemUL.parentElement.closest('ul:not(.main-menu)');
            if (listItemUL) {
              outterUlWidth += listItemUL.clientWidth;
            }
          }
          if (siblingUL) {
            // You've found the sibling <ul> element
            let siblingULRect = listItem.getBoundingClientRect();
            if (theme.dir == 'rtl') {
              if ((siblingULRect.left - siblingULRect.width - outterUlWidth + 150 < 0 && outterUlWidth < window.innerWidth) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
                targetObject.dirchange = true;
              } else {
                targetObject.dirchange = false;
              }
            } else {
              if ((outterUlWidth + siblingULRect.right + siblingULRect.width + 50 > window.innerWidth && siblingULRect.right >= 0) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
                targetObject.dirchange = true;
              } else {
                targetObject.dirchange = false;
              }
            }
          }
          setTimeout(() => {
            let computedValue = siblingUL.getBoundingClientRect();
            if ((computedValue.bottom) > window.innerHeight) {
              siblingUL.style.height = (window.innerHeight - computedValue.top - 8) + 'px';
              siblingUL.style.overflow = 'auto';
            }
          }, 100);
        }
      }
    }
    setMenuitems((arr) => [...arr]);
  }

  function setAncestorsActive(MENUITEMS, targetObject) {
    const theme = store.getState();
    const parent = findParent(MENUITEMS, targetObject);
    if (parent) {
      parent.active = true;
      if (parent.active) {
        ThemeChanger({ ...theme, toggled: "double-menu-open" });
      }

      setAncestorsActive(MENUITEMS, parent);
    } else {
      if (theme.dataVerticalStyle == "doublemenu") {
        ThemeChanger({ ...theme, toggled: "double-menu-close" });
      }

    }
  }

  function closeOtherMenus(MENUITEMS, targetObject) {
    for (const item of MENUITEMS) {
      if (item !== targetObject) {
        item.active = false;
        if (item.children && item.children.length > 0) {
          closeOtherMenus(item.children, targetObject);
        }
      }
    }
  }

  function findParent(MENUITEMS, targetObject) {
    for (const item of MENUITEMS) {
      if (item.children && item.children.includes(targetObject)) {
        return item;
      }
      if (item.children && item.children.length > 0) {
        const parent = findParent(MENUITEMS = item.children, targetObject);
        if (parent) {
          return parent;
        }
      }
    }
    return null;
  }

  	//
	function HoverToggleInnerMenuFn(event, item) {
		const theme = store.getState();
		let element = event.target;
		if (element && theme.dataNavLayout == "horizontal" && (theme.dataNavStyle == "menu-hover" || theme.dataNavStyle == "icon-hover")) {
			const listItem = element.closest("li");
			if (listItem) {
				// Find the first sibling <ul> element
				const siblingUL = listItem.querySelector("ul");
				let outterUlWidth = 0;
				let listItemUL = listItem.closest("ul:not(.main-menu)");
				while (listItemUL) {
					listItemUL = listItemUL.parentElement.closest("ul:not(.main-menu)");
					if (listItemUL) {
						outterUlWidth += listItemUL.clientWidth;
					}
				}
				if (siblingUL) {
					// You've found the sibling <ul> element
					let siblingULRect = listItem.getBoundingClientRect();
					if (theme.dir == "rtl") {
						if ((siblingULRect.left - siblingULRect.width - outterUlWidth + 150 < 0 && outterUlWidth < window.innerWidth) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
							item.dirchange = true;
						} else {
							item.dirchange = false;
						}
					} else {
						if ((outterUlWidth + siblingULRect.right + siblingULRect.width + 50 > window.innerWidth && siblingULRect.right >= 0) && (outterUlWidth + siblingULRect.width + siblingULRect.width < window.innerWidth)) {
							item.dirchange = true;
						} else {
							item.dirchange = false;
						}
					}
				}
			}
		}
	}
  const Sideclick = () => {
    if (window.innerWidth > 992) {
      let html = document.documentElement;
      if (html.getAttribute('data-icon-overlay') != 'open') {
        html.setAttribute('data-icon-overlay', 'open');
      }
   
    }
  }


 function handleAttributeChange(mutationsList) {
    for (const mutation of mutationsList) {
      if (mutation.type === 'attributes' && (mutation.attributeName === 'data-nav-layout' || mutation.attributeName === 'data-vertical-style')) {
            const newValue = mutation.target.getAttribute('data-nav-layout');
            if (newValue == 'vertical') {
                let currentPath = location.pathname.endsWith('/') ? location.pathname.slice(0, -1) : location.pathname;
                currentPath = !currentPath ? '/dashboard/ecommerce' : currentPath;
                setMenuUsingUrl(currentPath);
            } else {
                closeMenuFn();
            }
        }
    }
}

const handleClick = (event) => {
  // Your logic here
  event.preventDefault(); // Prevents the default anchor behavior (navigation)
  // ... other logic you want to perform on click
};
  return (
    <Fragment>
      <div id="responsive-overlay"
        onClick={() => { menuClose() }}
      ></div>
      <aside className="app-sidebar" id="sidebar" onMouseEnter={() => Onhover()}
        onMouseLeave={() => Outhover()}>

        <div className="main-sidebar-header" >
        <Link to={`${import.meta.env.BASE_URL}`} className="header-logo " >
                <img src={logo} alt="logo" className="desktop-logo animate-logo" style={{ background: 'white', padding: '6px', borderRadius: '80px', height:'3rem', transition: 'all 0.3s ease' }} />
            <img src={logo} alt="logo" className="toggle-logo animate-logo" style={{ background: 'white', padding: '6px', borderRadius: '80px', height:'3rem', transition: 'all 0.3s ease' }} />
            <img src={logo} alt="logo" className="desktop-dark animate-logo" style={{ background: 'white', padding: '6px', borderRadius: '80px', height:'3rem', transition: 'all 0.3s ease' }} />
            <img src={logo} alt="logo" className="toggle-dark animate-logo" style={{ background: 'white', padding: '6px', borderRadius: '80px', height:'3rem', transition: 'all 0.3s ease' }} />
            <img src={logo} alt="logo" className="desktop-white animate-logo" style={{ background: 'white', padding: '6px', borderRadius: '80px', height:'3rem', transition: 'all 0.3s ease' }} />
            <img src={logo} alt="logo" className="toggle-white animate-logo" style={{ background: 'white', padding: '6px', borderRadius: '80px', height:'3rem', transition: 'all 0.3s ease' }} />
          </Link>
        </div>
        <SimpleBar className="main-sidebar" id="sidebar-scroll">

          <nav className="main-menu-container nav nav-pills flex-column sub-open">
            <div className="slide-left" id="slide-left" onClick={() => { slideLeft(); }}><svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24"
              height="24" viewBox="0 0 24 24">
              <path d="M13.293 6.293 7.586 12l5.707 5.707 1.414-1.414L10.414 12l4.293-4.293z"></path>
            </svg></div>

            <ul className="main-menu" onClick={() => Sideclick()}>
              {filteredMenuItems.map((levelone) => (
                <Fragment key={Math.random()}>
                  <li className={`${levelone.menutitle ? 'slide__category' : ''} ${levelone.type === 'link' ? 'slide' : ''}
                       ${levelone.type === 'sub' ? 'slide has-sub' : ''} ${levelone?.active ? 'open' : ''} ${levelone?.selected ? 'active' : ''}`}>
                    {levelone.menutitle ?
                      <span className='category-name'>
                        {levelone.menutitle}
                      </span>
                      : ""}
                    {levelone.type === "link" ?
                      <Link to={levelone.path + "/"} className={`side-menu__item ${levelone.selected ? 'active' : ''}`} >
                        {levelone.icon}
                        <span className="side-menu__label">
                          {levelone.title}
                          {levelone.badgetxt ? (
                            <span className={levelone.class}>
                              {levelone.badgetxt}
                            </span>
                          ) : (
                            ""
                          )}
                        </span>
                      </Link>
                      : ""}
                    {levelone.type === "empty" ?
                      <Link to="#" className='side-menu__item' onClick={handleClick}>
                        {levelone.icon}
                        <span className="">
                          {levelone.title}
                          {levelone.badgetxt ? (
                            <span className={levelone.class}>
                              {levelone.badgetxt}
                            </span>
                          ) : (
                            ""
                          )}
                        </span>
                      </Link>
                      : ""}
                    {levelone.type === "sub" ?
                      <Menuloop MENUITEMS={levelone} level={level + 1} toggleSidemenu={toggleSidemenu} HoverToggleInnerMenuFn={HoverToggleInnerMenuFn} />
                      : ''}
                  </li>
                </Fragment>
              ))}
            </ul>
            <div className="slide-right" id="slide-right" onClick={() => { slideRight(); }}><svg xmlns="http://www.w3.org/2000/svg" fill="#7b8191" width="24"
              height="24" viewBox="0 0 24 24">
              <path d="M10.707 17.707 16.414 12l-5.707-5.707-1.414 1.414L13.586 12l-4.293 4.293z"></path>
            </svg>
            </div>
          </nav>

        </SimpleBar>

      </aside>
    </Fragment>
  )
    ;
}

const mapStateToProps = (state) => ({
  local_varaiable: state
});

export default connect(mapStateToProps, { ThemeChanger })(Sidebar);

