# Font APEX Icon Library

## [Browse Font APEX Icons](https://oracle.github.io/font-apex/)

## Introduction
Font APEX is an icon library initially designed for [Oracle APEX](https://apex.oracle.com) and [Universal Theme](https://apex.oracle.com/ut). It was originally intended as a replacement for Font Awesome 4, the web's leading icon library, and therefore contains almost all of the Font Awesome icons, re-drawn originally on a 16x16 grid as line-icons. We wanted to make it a seamless switch to go from Font Awesome to Font APEX, and therefore use the same "fa" prefix for the icons, making it easier than ever to move to entirely new icon library.

## Getting Started
Extract the release and keep `css/`, `fonts/`, and `images/flags/` together. Link the stylesheet in the head of your page. Both font families use WOFF2.
```
<link rel="stylesheet" href="css/font-apex.min.css?v=2.5.1" type="text/css" />
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

## Modifiers and flags

Add a modifier to a base icon, or use a flag class to display a country or territory. The icon browser includes all 41 modifiers and 254 flags. The flag example below announces the country name. When nearby text already names the country, use `aria-hidden="true"` in place of `role` and `aria-label`.

```html
<span class="fa fa-user fam-check" aria-hidden="true"></span>
<span class="fa fa-flag-ca" role="img" aria-label="Canada"></span>
```

## Upgrading from 2.2 to 2.5.1

Publish the release folders under a versioned path, such as `font-apex/2.5.1/`. Linking to that copy gives both WOFF2 files fresh URLs as well as the stylesheet.

Replace these five retired classes in your markup. The icon browser accepts their old names and shows the current class.

| 2.2 class | 2.5.1 class |
|---|---|
| `fa-emoji-stuck-out-tounge` | `fa-emoji-stuck-out-tongue` |
| `fa-emoji-stuck-out-tounge-closed-eyes` | `fa-emoji-stuck-out-tongue-closed-eyes` |
| `fa-emoji-stuck-out-tounge-wink` | `fa-emoji-stuck-out-tongue-wink` |
| `fa-location-arrow-solid` | `fa-location-arrow` |
| `fa-location-circle-solid` | `fa-location-circle` |

Three existing classes now select the solid glyph. To keep their 2.2 outline appearance, use the following classes.

| 2.2 class | 2.5.1 class |
|---|---|
| `fa-location-arrow` | `fa-location-arrow-o` |
| `fa-location-circle` | `fa-location-circle-o` |
| `fa-map-marker` | `fa-map-marker-o` |

## Icon Library
There are two families of icons within Font APEX - Small and Large.

- **Small icons** are based on a 16x16 grid and ideally suited for buttons and menus.
- **Large icons** are based on a 32x32 grid and well suited for places where you need to provide a larger graphic, such as cards, media lists, and hero regions.

Many [Oracle APEX](https://apex.oracle.com/) components will automatically use the small or large icons based on the context (such as Template Options), so all you need to do is focus on the icon you want. For example, when using Cards, the Block and Featured template option will automatically show the larger versions of icons where the Basic and Compact template options will use icons from the smaller set.

For right-to-left layouts, set `dir="rtl"` and add `class="u-RTL"` to a container. Supported directional icons such as `fa-arrow-right` then use their mirrored glyph. Add `fa-dir-strict` to an icon to preserve its direction.

You can see all of the Font APEX icons on the [Oracle APEX - Universal Theme Sample Application](https://apex.oracle.com/fontapex).

## Contributing

This project is not accepting external contributions at this time. For bugs or enhancement requests, please file a GitHub issue unless it’s security related. When filing a bug remember that the better written the bug is, the more likely it is to be fixed. If you think you’ve found a security vulnerability, do not raise a GitHub issue and follow the instructions in our [security policy](./SECURITY.md).

## Security

Please consult the [security guide](./SECURITY.md) for our responsible security vulnerability disclosure process

## License

Fonts: SIL OFL 1.1 License (https://scripts.sil.org/OFL)
Icons + Code: MIT License (https://opensource.org/licenses/MIT)

Please read the LICENSE.txt file for additional details.
