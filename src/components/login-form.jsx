import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import kakaoLoginImage from '../assets/kakao_login_medium_wide.png';

export function LoginForm({ open, onOpenChange, className, ...props }) {
  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/google`
  }

  const handleKakaoLogin = () => {
    window.location.href = `${import.meta.env.VITE_CORE_API_BASE_URL}/oauth2/authorization/kakao`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-xl">안녕하세요</CardTitle>
            <CardDescription>
              구글 또는 네이버 계정으로 로그인 하세요!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form>
              <div className="grid gap-6">
                <div className="flex flex-col gap-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGoogleLogin}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                    </svg>
                    Google로 로그인
                  </Button>
                  <img 
                    src={kakaoLoginImage} 
                    alt="Kakao Login" 
                    onClick={handleKakaoLogin}
                    className="cursor-pointer"
                  />
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
