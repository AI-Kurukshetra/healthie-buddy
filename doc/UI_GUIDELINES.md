# UI Guidelines

## Layout
- Use a centered container layout for app pages.
- Use `max-w-[1200px]` for dashboard content containers.
- Use `max-w-[420px]` for auth form cards.

## Auth Pages
- Build auth forms with shadcn/ui Card layout.
- Include title and subtitle at the top of each auth card.
- Every input must include a visible label.
- Show the role selector only on registration, where it determines profile provisioning.
- Do not ask for role selection on login; resolve the user role after authentication.
- Primary action uses the default button style.
- Secondary navigation links route between login/register.

## Spacing
- Use `space-y-6` for form section spacing.
- Keep card/content padding consistent across screens.

## Typography
- Use `h1` for the page title.
- Add muted subtitle/description text below headings.
