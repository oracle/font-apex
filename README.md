# Font APEX Icon Library

## [Browse Font APEX Icons](https://oracle.github.io/font-apex/)

## Introduction
Font APEX is an icon library initially designed [Oracle APEX](https://apex.oracle.com) and [Universal Theme](https://apex.oracle.com/ut). It was originally intended as a replacement for Font Awesome 4, the web's leading icon library, and therefore contains almost all of the Font Awesome icons, re-drawn originally on a 16x16 grid as line-icons. We wanted to make it a seamless switch to go from Font Awesome to Font APEX, and therefore use the same "fa" prefix for the icons, making it easier than ever to move to entirely new icon library.

## Getting Started
Download and extract Font APEX, and then simply include a link to the Font APEX css file in your HTML header.
```
<link rel="stylesheet" href="css/font-apex.min.css?v=2.2" type="text/css" />
```

To display the icon in your UI, use the following markup and just replace the `fa-apex` with class for the icon you want to use.
```
<span class="fa fa-apex" aria-hidden="true"></span>
```

To display the larger size icons, add the `fa-lg` modifier class. This will display the icon with the more detailed 32px version.
```
<span class="fa fa-apex fa-lg" aria-hidden="true"></span>
```

You can also apply the `force-fa-lg` modifier class to any container to force all icons within it to use the larger icons.

## Icon Library
There are two families of icons within Font APEX - Small and Large.

- **Small icons** are based on a 16x16 grid and ideally suited for buttons and menus.
- **Large icons** are based on a 32x32 grid and well suited for places where you need to provide a larger graphic, such as cards, media lists, and hero regions.

Many [Oracle APEX](https://apex.oracle.com/) components will automatically use the small or large icons based on the context (such as Template Options), so all you need to do is focus on the icon you want. For example, when using Cards, the Block and Featured template option will automatically show the larger versions of icons where the Basic and Compact template options will use icons from the smaller set.

There are over 1000 icons in Font APEX, and there are 25 modifiers you can place on top of any existing icons so you can customize any icon to fit your needs.

Font APEX is also well suited for bi-directional languages. Icons with arrows, such as fa-arrow-right will automatically flip horizontally when viewed in a Right-to-Left language such as Arabic or Farsi. You can prevent this default behavior by adding the fa-dir-strict modifier class.

You can see all of the Font APEX icons on the [Oracle APEX - Universal Theme Sample Application](https://apex.oracle.com/fontapex).

# License
Fonts: SIL OFL 1.1 License (https://scripts.sil.org/OFL)
Icons + Code: MIT License (https://opensource.org/licenses/MIT)

Please read the LICENSE.txt file for additional details.
