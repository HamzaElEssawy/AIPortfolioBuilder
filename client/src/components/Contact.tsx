import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { insertContactSubmissionSchema, type InsertContactSubmission } from "@shared/schema";
import { Mail, Linkedin, MapPin } from "lucide-react";

export default function Contact() {
  const { toast } = useToast();
  const [projectType, setProjectType] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InsertContactSubmission>({
    resolver: zodResolver(insertContactSubmissionSchema),
    defaultValues: {
      name: "",
      email: "",
      projectType: "",
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContactSubmission) => {
      const response = await apiRequest("POST", "/api/contact", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Message Sent!",
        description: data.message,
      });
      reset();
      setProjectType("");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContactSubmission) => {
    contactMutation.mutate({ ...data, projectType });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hamza@example.com",
      color: "bg-emerald",
    },
    {
      icon: Linkedin,
      title: "LinkedIn",
      value: "8,741+ Followers",
      color: "bg-emerald",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Kuala Lumpur, Malaysia",
      color: "bg-emerald",
    },
  ];

  return (
    <section id="contact" className="py-20 bg-navy text-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-bold text-4xl mb-4">Let's Build Something Great Together</h2>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Ready to scale your AI vision? Let's discuss how we can transform your ideas into market-leading solutions.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-12">
          <div>
            <h3 className="font-semibold text-2xl mb-6">Get In Touch</h3>
            <div className="space-y-6">
              {contactInfo.map((info, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-12 h-12 ${info.color} rounded-full flex items-center justify-center mr-4`}>
                    <info.icon className="text-white h-6 w-6" />
                  </div>
                  <div>
                    <div className="font-semibold">{info.title}</div>
                    <div className="text-blue-200">{info.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label className="block text-blue-100 font-medium mb-2">Name</Label>
                <Input
                  {...register("name")}
                  className="w-full px-4 py-3 bg-blue-900 border border-blue-700 text-white placeholder:text-blue-300 focus:border-emerald"
                  placeholder="Your name"
                />
                {errors.name && (
                  <p className="text-red-400 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label className="block text-blue-100 font-medium mb-2">Email</Label>
                <Input
                  type="email"
                  {...register("email")}
                  className="w-full px-4 py-3 bg-blue-900 border border-blue-700 text-white placeholder:text-blue-300 focus:border-emerald"
                  placeholder="your@email.com"
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              
              <div>
                <Label className="block text-blue-100 font-medium mb-2">Project Type</Label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger className="w-full px-4 py-3 bg-blue-900 border border-blue-700 text-white focus:border-emerald">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="AI Product Development">AI Product Development</SelectItem>
                    <SelectItem value="Product Leadership Consulting">Product Leadership Consulting</SelectItem>
                    <SelectItem value="Technical Advisory">Technical Advisory</SelectItem>
                    <SelectItem value="Speaking Opportunity">Speaking Opportunity</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {!projectType && (
                  <p className="text-red-400 text-sm mt-1">Please select a project type</p>
                )}
              </div>
              
              <div>
                <Label className="block text-blue-100 font-medium mb-2">Message</Label>
                <Textarea
                  {...register("message")}
                  rows={4}
                  className="w-full px-4 py-3 bg-blue-900 border border-blue-700 text-white placeholder:text-blue-300 focus:border-emerald resize-none"
                  placeholder="Tell me about your project..."
                />
                {errors.message && (
                  <p className="text-red-400 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={contactMutation.isPending || !projectType}
                className="w-full bg-warm-orange hover:bg-warm-orange/90 text-white font-semibold py-4"
              >
                {contactMutation.isPending ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
