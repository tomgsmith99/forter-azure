# Forter + Azure B2C integration

This project provides an example of how to integrate Forter's decision engine with Microsoft Azure Active Directory B2C.

This project is focused on the sign-up use-case, but the principles are similar for sign-in use-cases.

This project uses the `LocalAccounts` example from the Azure B2C starter pack.

## Prerequisites

You should have a Forter tenant and an instance of MSFT B2C.

## Setup

### Set up your baseline custom policies
In your B2C tenant, [set up a baseline custom policy with the starter pack](https://docs.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-overview)

Test your B2C tenant to ensure the baseline sign-up and sign-in policies are working.

### Update & upload the HTML files

The example html files provided in this repo have used the [standard MSFT templates](https://docs.microsoft.com/en-us/azure/active-directory-b2c/customize-ui-with-html) as a starting point.

In these example HTML files, replace the example Forter javascript snippet with the javascript snippet for your Forter tenant.

Upload the html files to a cdn of your choice.

Make sure to allow CORS requests in your cdn.

### Set up your proxy / middleware

A small piece of middleware is provided in this repo to provide a couple of small capabilities to facilitate communicaiton between Forter and Azure B2C, primarily:

* Azure B2C does not allow custom headers; the Forter API requires an `api-version` header
* When Azure B2C receives a 409 status response from an external API during a sign-up flow, it will render an error message to the end user and not create the user. The middleware "translates" Forter's `decline` decision into a 409 response to Azure B2C.
* The proxy includes some test cases.

The example proxy is a small NodeJS app.

If you want to test the proxy locally, update the values in the `.env` file with values that are appropriate for your environment.

Note: A `.env` file is not usually committed to a git repo, because it usually contains secrets. In this setup, I have stored the Forter secret in Azure B2C. If you decide to add a secret to the `.env` file, make sure you add the `.env` file to a `.gitignore` file.

Push the `app.js` file to your preferred hosting platform for NodeJS.

Add the values from `.env` to your NodeJS hosting platform.

### Add your Forter Key to Azure B2C

Note: In this setup, I have chosen to store the Forter key in Azure B2C. But, you could also store the Forter key in the proxy.

Follow the directions [here](https://docs.microsoft.com/en-us/azure/active-directory-b2c/secure-rest-api) to add your Forter key to your Azure B2C tenant.

Note: Forter uses Basic Authentication, but without a password (username only). In its Basic Authenticaiton setup, Axure B2C requires a password. So, to store the Forter key in Azure B2C, use the "API key authentication" instructions [here](https://docs.microsoft.com/en-us/azure/active-directory-b2c/secure-rest-api?tabs=macos&pivots=b2c-custom-policy#api-key-authentication). Or, if you are using a proxy, let the proxy handle the Forter Basic Authentication. 

### Update & upload the XML files

If you haven't already, update all of the XML files in this repo with your Microsoft tenant name.

Make sure to update the application ids in the `TrustFrameworkExtensions.xml` file per the instructions [here](https://docs.microsoft.com/en-us/azure/active-directory-b2c/tutorial-create-user-flows?pivots=b2c-custom-policy#add-application-ids-to-the-custom-policy).

Update the `TrustFrameworkExtensions.xml` file with the URI of your uploaded html files. There is one instance of `unified.html` and two instances of `selfAsserted.html`.

Update the `TrustFrameworkExtensions.xml` file with the URI of your proxy app.

Upload the XML policy files to your Azure B2C tenant.

### Test the integration

In your Identity Experenice Framework screen, click on `B2C_1A_SIGNUP_SIGNIN`.

Click on 'Run now'.

Click on 'Sign up now'.

If you are using the proxy included with this example, then you should see the following behavior:

If you sign up with a user with "approve" in their email address, then Forter will approve the sign-up attempt, the user record will be created in Azure B2C, and the user will be authenticated with a `forter_decision: approve` claim in their id token.

If you sign up with a user with "decline" in their email address, then Forter will decline the sign-up attempt, and the proxy will issue a 409 status to Azure B2C. The user will see an error message, and the user record will not be created.

If you sign up with any other email address, then Forter will issue a "not reviewed" decision, the user record will be created in Azure B2C, and the user will be authenticated with a `foter_decision: not_reviewed` claim in their id token. 
