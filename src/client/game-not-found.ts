const searchParams = new URLSearchParams(window.location.search);

// Redirect the user to home page to create a new game if 'auto-create' flag is set
if (searchParams.has('flags') && searchParams.get('flags')!.includes('a'))
    window.location.href = `/${window.location.search}`;
