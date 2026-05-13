import React from 'react';
import { Amplify } from 'aws-amplify';

import {
	Authenticator,
	Label,
	Placeholder,
	useAuthenticator,
} from '@aws-amplify/ui-react';
import { signIn } from 'aws-amplify/auth';

Amplify.configure({
	Auth: {
		Cognito: {
			userPoolId: process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_ID!,
			userPoolClientId:
				process.env.NEXT_PUBLIC_AWS_COGNITO_USER_POOL_CLIENT_ID!,
		},
	},
});

const formFields = {
	signIn: {
		username: {
			Placeholder: 'Introdu email',
			Label: 'Email',
			isRequired: true,
		},
		password: {
			placeholder: 'Introdu parola',
			label: 'Password',
			isRequired: true,
		},
	},
	signUp: {
		username: {
			Placeholder: 'Introdu email',
			Label: 'Email',
			isRequired: true,
		},
		password: {
			placeholder: 'Introdu parola',
			label: 'Password',
			isRequired: true,
		},
	},
};

const Auth = ({ children }: { children: React.ReactNode }) => {
	const { user } = useAuthenticator((context) => [context.user]);

	return (
		<div className="h-full">
			{/* <Authenticator components={components} formFields={formFields}>
				{() => <>{children}</>}
			</Authenticator> */}
		</div>
	);
};

export default Auth;
