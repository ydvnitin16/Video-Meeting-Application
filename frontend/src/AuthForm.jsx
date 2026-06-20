import React, { useState } from "react";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import axios from "axios";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./components/ui/card";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const AuthForm = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    async function handleAuth() {
        if (!email.trim()) return;

        setLoading(true);
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_SERVER_URL}/api/v1/signup`,
                { email },
                { withCredentials: true },
            );

            if (data.success) {
                toast.success("Welcome!");
                navigate("/");
            }
        } catch (err) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className='h-screen w-full flex justify-center items-center'>
            <Card className={"w-full max-w-sm"}>
                <CardHeader>
                    <CardTitle>Get Started</CardTitle>
                    <CardDescription>
                        Enter your email to sign up or log back in
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleAuth();
                        }}
                    >
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
                    <Button
                        className={"w-full"}
                        onClick={handleAuth}
                        disabled={loading}
                    >
                        {loading ? "Please wait..." : "Continue"}
                    </Button>
                </CardFooter>
            </Card>
        </main>
    );
};

export default AuthForm;
