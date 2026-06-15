import React, { useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { FieldLabel } from "./components/ui/field";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./components/ui/card";

const AuthForm = () => {
    const [email, setEmail] = useState();

    function handleAuth() {
        const response = axios.post(
            `${import.meta.env.VITE_SERVER_URL}/api/v1/signup`,
            { email },
            { withCredentials: true },
        );
        console.log(response);
    }

    return (
        <main className='h-screen w-full flex justify-center items-center'>
            <Card className={"w-full max-w-sm"}>
                <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                        Create for your seprate identity as peer
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form>
                        <div className='flex flex-col gap-6'>
                            <div className='grid gap-2'>
                                <Label htmlFor='email'>Email</Label>
                                <Input
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    id='email'
                                    type='email'
                                    placeholder='m@example.com'
                                    required
                                />
                            </div>
                        </div>
                    </form>
                </CardContent>
                <CardFooter>
                    <Button className={"w-full"} onClick={handleAuth}>
                        Sign Up
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
};

export default AuthForm;
