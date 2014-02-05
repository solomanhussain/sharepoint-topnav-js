function compare(a, b) {
    if (a.last_nom < b.last_nom)
        return -1;
    if (a.last_nom > b.last_nom)
        return 1;
    return 0;
}

String.format = function() {
    var s = arguments[0];
    for (var i = 0; i < arguments.length - 1; i++) {
        var reg = new RegExp("\\{" + i + "\\}", "gm");
        s = s.replace(reg, arguments[i + 1]);
    }

    return s;
}

function menuItem(id, title, url, sortId, parentId) {
    this.id = id;
    this.title = title;
    this.url = url;
    this.sortId = sortId;
    this.submenus = [];
    this.parentId = parentId;
}

function loadTopNavigation() {
    var ctx = new SP.ClientContext.get_current();
    var oMenuList = ctx.get_web().get_lists().getByTitle("Home Navigation");
    var camlQuery = new SP.CamlQuery();
    this.allMenuItems = oMenuList.getItems(camlQuery);
    ctx.load(this.allMenuItems);

    ctx.executeQueryAsync(Function.createDelegate(this, this.onloadTopNavigationCallback), Function.createDelegate(this, this.onFailedCallback));
}

function onFailedCallback(sender, args) {
    SP.UI.Notify.addNotification('Request failed: ' + args.get_message() + '\n' + args.get_stackTrace(), false);
}

function buildMenu(aList) {
    if (aList.length > 0) {
        // console.info("building menu");
        var menu = {
            innerHtml: "<div class='menu horizontal menu-horizontal'><ul class='root static'>"
        };
        //Adding homepage link.
        menu.innerHtml += "<li class='static selected'><a class='static selected menu-item' href='/SitePages/Home.aspx' accesskey='1'><span class='additional-background'><span class='menu-item-text'>Home Page</span><span class='ms-hidden'>Currently selected</span></span></a>";
        buildSubMenu(aList, menu);
        menu.innerHtml += "</ul></div>";
        //Need to set the first UL as root.
        $('#top-navigation-bar').html(menu.innerHtml);
        // $('#top-navigation-bar ul:first-child').addClass('root');

    }
}

function buildSubMenu(aList, menu) {
    menu.innerHtml += "<ul class='static'>";
    for (var i = 0, len = aList.length; i < len; i++) {
        var subClass = "";
        if (aList[i].submenus.length > 0)
            subClass = "dynamic-children"

        menu.innerHtml += String.format("<li class='static " + subClass + "'><a href='{0}' class='static menu-item " + subClass + "'><span class='additional-background'><span class='menu-item-text'>{1}</span></span></a>", aList[i].url, aList[i].title);
        if (subClass != "")
            buildSubMenu(aList[i].submenus, menu);
        menu.innerHtml += "</li>";
    }
    menu.innerHtml += "</ul>";
}

function onloadTopNavigationCallback(sender, args) {
    var menuItems = createList();
    var roots = [];

    for (var i = 0, len = menuItems.length; i < len; i++) {
        if (menuItems[i].parentId == null) {
            roots.push(menuItems[i]);
        }
    }

    if (roots.length > 0) {
        for (var i = 0, len = roots.length; i < len; i++) {
            addChildren(roots[i], menuItems);
        }
        buildMenu(roots);
    }
}

function createList() {
    // console.info("creating list");
    var templist = [];
    var enumerator = this.allMenuItems.getEnumerator();
    while (enumerator.moveNext()) {
        var li = enumerator.get_current();
        var navigationUrl;
        try {
            navigationUrl = li.get_item("Navigation_x0020_URL").get_url();
        } catch (err) {
            navigationUrl = "";
        }
        var parentId;
        try {
            parentId = li.get_item("Parent_x0020_ID").get_lookupId();
        } catch (err) {
            parentId = null;
        }
        console.info(li.get_item("ID") + " parent: " + parentId);
        templist.push(new menuItem(li.get_item("ID"), li.get_item("Title"), navigationUrl, li.get_item("Sort_x0020_Order"), parentId));
    }
    return templist;
}

function addChildren(node, source) {
    // console.info("addChildren to " + node.title);
    for (var i = 0, len = source.length; i < len; i++) {
        // console.info("Parent ID: " + source[i].parentId + " ?? Node ID: " + node.id);
        if (source[i].parentId == node.id) {
            // console.info("match");
            node.submenus.push(source[i]);
            addChildren(source[i], source);
        }
    }
}

ExecuteOrDelayUntilScriptLoaded(loadTopNavigation, 'sp.js');