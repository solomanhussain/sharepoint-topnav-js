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
    // var menuHTML = "<div class='menu horizontal menu-horizontal'><ul class=''>";
    if (aList.length > 0) {
        console.info("building menu");
        var menu = {
            innerHtml: "<div class=''>"
        };
        // for (var i = 0, len = aList.length; i < len; i++) {
        //     menuHTML += String.format("<li>{0}</li>", aList[i].title);
        //     if (aList[i].submenus.lenght > 0)
        //         buildMenu(aList[i].submenus, menuHTML);
        //     //menuHTML += String.format("<li class='static selected'><a class='static selected menu-item' href='{1}'><span class='additional-background'><span class='menu-item-text'>{0}</span></span></a></li>", aList[i].title, aList[i].url);
        // }

        buildSubMenu(aList, menu);
        menu.innerHtml += "</div>";
        $('#top-navigation-bar').html(menu.innerHtml);
    }
}

function buildSubMenu(aList, menu) {
    menu.innerHtml += "<ul>";
    for (var i = 0, len = aList.length; i < len; i++) {
        menu.innerHtml += String.format("<li>{0}</li>", aList[i].title);
        if (aList[i].submenus.length > 0)
            buildSubMenu(aList[i].submenus, menu);
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
    console.info("creating list");
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
    console.info("addChildren to " + node.title);
    for (var i = 0, len = source.length; i < len; i++) {
        console.info("Parent ID: " + source[i].parentId + " ?? Node ID: " + node.id);
        if (source[i].parentId == node.id) {
            console.info("match");
            node.submenus.push(source[i]);
            addChildren(source[i], source);
        }
    }
}
ExecuteOrDelayUntilScriptLoaded(loadTopNavigation, 'sp.js');