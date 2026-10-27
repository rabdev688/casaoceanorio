# Casa Oceano Rio 

React + Vite + Tailwind CSS site for the Casa Oceano Rio vacation rental.

## Project structure

- `src/main.tsx` mounts `src/App.tsx` inside `BrowserRouter`
- `src/App.tsx` is the shell: navbar, routes, footer
- `src/pages/` holds Home, About, Gallery, Amenities, Location, and Book
- `src/index.css` is the global CSS entry and the Tailwind CSS v4 import
- `index.html` is the Vite HTML shell
- `vite.config.ts` configures React, Tailwind CSS v4, and the `@` alias for `src`
- `vercel.json` rewrites every path to `index.html` so client routes work on refresh

## Styling

Tailwind CSS v4 is loaded with `@import 'tailwindcss';` in `src/index.css`. Use utility classes in JSX. Put global styles and theme values in `src/index.css`. There is no Tailwind config file and no PostCSS config.

Keep CSS `@import` statements first. Put global element styles, such as resets and defaults for `body`, headings, `button`, or `input`, inside `@layer base { ... }` so utility classes on those elements still apply.
