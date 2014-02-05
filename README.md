Sharepoint 2010 Custom Top Navigation (js)
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

Using the following link as an example 
http://stackoverflow.com/questions/15867478/build-tree-type-list-by-recursively-checking-parent-child-relationship-c-sharp

```
public static class GroupEnumerable
{
    public static IList<Group> BuildTree(this IEnumerable<Group> source)
    {
        var groups = source.GroupBy(i => i.ParentID);

        var roots = groups.FirstOrDefault(g => g.Key.HasValue == false).ToList();

        if (roots.Count > 0)
        {
            var dict = groups.Where(g => g.Key.HasValue).ToDictionary(g => g.Key.Value, g => g.ToList());
            for (int i = 0; i < roots.Count; i++)
                AddChildren(roots[i], dict);
        }

        return roots;
    }

    private static void AddChildren(Group node, IDictionary<int, List<Group>> source)
    {
        if (source.ContainsKey(node.ID))
        {
            node.Children = source[node.ID];
            for (int i = 0; i < node.Children.Count; i++)
                AddChildren(node.Children[i], source);
        }
        else
        {
            node.Children = new List<Group>();
        }
    }
}
```