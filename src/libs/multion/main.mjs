import axios from 'axios';
import simple_oauth2 from 'simple-oauth2';

import {
  existsSync,
  statSync,
  readFileSync,
  writeFileSync,
  unlinkSync,
} from 'fs';
import open from 'open';
import express from 'express';

const _post = axios.post;
const _get = axios.get;

const { AuthorizationCode } = simple_oauth2;

class Multion {
  constructor(clientId, clientSecret, tokenFile = 'multion_token.txt') {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tokenFile = tokenFile;
    this.token = null;
    this.refreshURL = 'https://auth.multion.ai/oauth2/token';

    // Try to load the token from the token file
    if (existsSync(this.tokenFile) && statSync(this.tokenFile).size > 0) {
      // check if file is not empty
      try {
        this.token = JSON.parse(readFileSync(this.tokenFile, 'utf-8'));
      } catch (error) {
        console.log(
          'Error reading token from file. The file might be corrupted.',
        );
        this.token = null;
      }
    }
  }
  async login() {
    // If the token is already loaded, no need to log in again
    if (this.token !== null) {
      console.log('Already logged in');
      return;
    }

    // OAuth endpoints
    const authorizationBaseUrl = 'https://auth.multion.ai/oauth2/authorize';
    const tokenUrl = 'https://auth.multion.ai/oauth2/token';
    const redirectUri = 'http://localhost:8000/callback';

    // Create an OAuth2 session
    const oauth = new AuthorizationCode({
      client: {
        id: this.clientId,
        secret: this.clientSecret,
      },
      auth: {
        authorizeHost: 'https://auth.multion.ai',
        authorizePath: '/oauth2/authorize',
        tokenHost: 'https://auth.multion.ai',
        tokenPath: '/oauth2/token',
      },
    });

    // Generate the authorization URL
    const authorizationUri = oauth.authorizeURL({
      redirect_uri: redirectUri,
    });

    // Open the authorization URL in a new browser tab
    open(authorizationUri);

    // Create a temporary server to handle the callback
    const app = express();
    const server = app.listen(8000, () => {
      console.log('Server listening on port 8000');
    });

    // Wrap the callback handling in a promise for synchronous-like behavior
    return new Promise((resolve, reject) => {
      // Handle the callback from the OAuth provider
      app.get('/callback', async (req, res) => {
        try {
          const code = req.query.code;

          // Exchange the authorization code for an access token
          const tokenParams = {
            code,
            redirect_uri: redirectUri,
          };
          const result = await oauth.getToken(tokenParams);

          // Save the access token to the token file
          this.token = result.token;
          writeFileSync(this.tokenFile, JSON.stringify(this.token));

          console.log('Login successful!');
          resolve('Login completed');
        } catch (error) {
          console.log('Error during login:', error.message);
          reject(error);
        } finally {
          // Close the server
          server.close();
        }

        // Redirect the user to a success page
        res.send('<script>window.close()</script>');
      });
    });
  }

  async post(url, data, tabId = null) {
    if (!this.token) {
      throw new Error('You must log in before making API calls.');
    }

    let headers = {
      Authorization: `Bearer ${this.token.access_token}`,
    };

    if (tabId !== null) {
      url = `https://multion-api.fly.dev/sessions/${tabId}`;
    }

    let attempts = 0;
    while (attempts < 5) {
      // tries up to 5 times
      try {
        const response = await axios.post(url, data, {
          headers: headers,
          timeout: 30000,
        });

        if (response.status >= 200 && response.status < 400) {
          try {
            return response.data.response.data;
          } catch (error) {
            console.log(
              "JSONDecodeError: The server didn't respond with valid JSON.",
            );
            break;
          }
        }
      } catch (error) {
        if (!error.response) {
          // timeout error
          console.log('Timeout error');
          return { message: "Task didn't complete" };
        }

        console.log('error', error.response.status);
        if (error.response.status === 401) {
          // token has expired
          console.log('Invalid token. Refreshing...');
          await this.refreshToken(); // Assuming you have a method to refresh token
          headers['Authorization'] = `Bearer ${this.token.access_token}`; // Update the authorization header
        } else if (error.response.status === 404) {
          // server not connected
          console.log(
            'Server Disconnected. Please press connect in the Multion extension popup',
          );
        }
      }

      // If we've not returned by now, sleep before the next attempt
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Sleep for 1 second

      attempts++;
    }

    // If we've exhausted all attempts and not returned, raise an error
    if (attempts === 5) {
      throw new Error('Failed to get a valid response after 5 attempts');
    }
  }

  async get() {
    if (this.token === null) {
      throw new Error('You must log in before making API calls.');
    }

    const headers = { Authorization: `Bearer ${this.token['access_token']}` };
    const url = 'https://multion-api.fly.dev/sessions';

    const response = await _get(url, { headers });
    return response.data.response.data;
  }

  async newSession(data) {
    const url = 'https://multion-api.fly.dev/sessions';
    return await this.post(url, data);
  }

  async updateSession(tabId, data) {
    const url = `https://multion-api.fly.dev/session/${tabId}`;
    return await this.post(url, data);
  }

  async listSessions() {
    return await this.get();
  }

  async refreshToken() {
    // OAuth endpoints
    const tokenURL = 'https://auth.multion.ai/oauth2/token';
    const redirectURI = 'http://localhost:8000/callback';

    const auth = {
      username: this.clientId,
      password: this.clientSecret,
    };

    const data = {
      grant_type: 'refresh_token',
      refresh_token: this.token.refresh_token,
      redirect_uri: redirectURI,
    };

    try {
      const response = await axios.post(tokenURL, data, { auth });
      this.token = response.data;

      // Save the token to the token file
      writeFileSync(this.tokenFile, JSON.stringify(this.token));
    } catch (error) {
      console.error(`Failed to refresh token: ${error}`);
    }
  }

  deleteToken() {
    if (existsSync(this.tokenFile)) {
      unlinkSync(this.tokenFile);
    } else {
      console.log(
        'No active session found. Access token has already been revoked.',
      );
    }
  }
}

export default Multion;
// module.exports = Multion;
