Sharepoint Top Navigation in Javascript
====================

Populates a Sharepoint 2010 top navigation from a custom list using javascript.

The custom list follows the below structure

|Sort Order|Title|Navigation URL|Parent|Parent:ID|

Parent is a lookup field 
Title is unique and is text
Sort Order is numeric
Navigation URL is a URL link


I reference this script file in the master page.
```
<SharePoint:Scriptlink runat="server" Name="~sitecollection/SiteAssets/Widgets/Navigation/navi.js" Language="javascript"/>
```

I've left a html tag in the master page to inject the menu into.
```
<!-- Horizontal Navigation Bar -->
<div id="top-navigation-bar" class="s4-tn"></div>
```