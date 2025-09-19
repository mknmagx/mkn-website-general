"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Search,
  Factory,
  Package,
  Truck,
  Globe,
  CreditCard,
  Shield,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Icon mapping
const iconMap = {
  HelpCircle,
  Factory,
  Package,
  Truck,
  Globe,
  CreditCard,
  Shield,
};

function FAQItem({ question, answer, isOpen, onToggle }) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card className="border border-gray-200 dark:border-gray-700">
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors p-4 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <CardTitle className="text-left text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-tight">
                {question}
              </CardTitle>
              {isOpen ? (
                <ChevronUp className="h-5 w-5 text-orange-500 flex-shrink-0" />
              ) : (
                <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="pt-0 p-4 sm:p-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm sm:text-base">
              {answer}
            </p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

function CategoryCard({ categoryKey, category, selectedCategory, onSelect }) {
  const IconComponent = iconMap[category.icon] || HelpCircle;
  const isSelected = selectedCategory === categoryKey;

  const colorClasses = {
    blue: isSelected
      ? "bg-blue-500 text-white"
      : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400",
    green: isSelected
      ? "bg-green-500 text-white"
      : "bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400",
    purple: isSelected
      ? "bg-purple-500 text-white"
      : "bg-purple-50 text-purple-600 hover:bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400",
    orange: isSelected
      ? "bg-orange-500 text-white"
      : "bg-orange-50 text-orange-600 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400",
    pink: isSelected
      ? "bg-pink-500 text-white"
      : "bg-pink-50 text-pink-600 hover:bg-pink-100 dark:bg-pink-900/20 dark:text-pink-400",
    yellow: isSelected
      ? "bg-yellow-500 text-white"
      : "bg-yellow-50 text-yellow-600 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400",
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 border-2 ${
        isSelected
          ? "border-current shadow-lg"
          : "border-gray-200 dark:border-gray-700 hover:shadow-md"
      }`}
      onClick={() => onSelect(categoryKey)}
    >
      <CardContent className={`p-4 sm:p-6 ${colorClasses[category.color]}`}>
        <div className="flex items-center gap-3">
          <IconComponent className="h-6 w-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-sm sm:text-base">
              {category.title}
            </h3>
            <p className="text-xs sm:text-sm opacity-75">
              {category.questions.length} soru
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function SSSClientComponent({ faqCategories }) {
  const [selectedCategory, setSelectedCategory] = useState("genel");
  const [openQuestion, setOpenQuestion] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filter questions based on search term
  const filteredQuestions =
    selectedCategory === "all"
      ? Object.values(faqCategories).flatMap((category) =>
          category.questions.filter(
            (q) =>
              q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
              q.answer.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      : faqCategories[selectedCategory]?.questions.filter(
          (q) =>
            q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
            q.answer.toLowerCase().includes(searchTerm.toLowerCase())
        ) || [];

  const handleQuestionToggle = (questionId) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

  const handleCategoryChange = (newCategory) => {
    setIsLoading(true);
    setSelectedCategory(newCategory);
    setOpenQuestion(null);
    // Simulate loading for better UX
    setTimeout(() => setIsLoading(false), 200);
  };

  const totalQuestions = Object.values(faqCategories).reduce(
    (total, category) => total + category.questions.length,
    0
  );

  return (
    <div>
      {/* CSS Animations */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out;
          }
          
          .animate-slide-up {
            animation: slideUp 0.4s ease-out both;
          }
        `,
        }}
      />

      <section className="py-16 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 py-12 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-orange-500 rounded-full">
                  <HelpCircle className="h-8 w-8 text-white" />
                </div>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Sıkça Sorulan Sorular
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-3xl mx-auto">
                MKN Group hakkında merak ettiğiniz tüm soruların yanıtlarını
                burada bulabilirsiniz.
                <span className="text-orange-600 dark:text-orange-400 font-semibold">
                  {" "}
                  {totalQuestions} soru
                </span>{" "}
                ile kapsamlı bilgi merkezi. Aradığınızı bulamazsanız, bizimle
                iletişime geçmekten çekinmeyin.
              </p>

              {/* Search Bar */}
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Sorularınızı arayın..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full rounded-full border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <section className="py-12 lg:py-20">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="grid lg:grid-cols-4 gap-8">
              {/* Category Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                    Kategoriler
                  </h2>

                  {/* All Categories Option */}
                  <CategoryCard
                    categoryKey="all"
                    category={{
                      title: "Tüm Sorular",
                      icon: "HelpCircle",
                      color: "blue",
                      questions: Object.values(faqCategories).flatMap(
                        (cat) => cat.questions
                      ),
                    }}
                    selectedCategory={selectedCategory}
                    onSelect={handleCategoryChange}
                  />

                  {/* Individual Categories */}
                  {Object.entries(faqCategories).map(([key, category]) => (
                    <CategoryCard
                      key={key}
                      categoryKey={key}
                      category={category}
                      selectedCategory={selectedCategory}
                      onSelect={handleCategoryChange}
                    />
                  ))}
                </div>
              </div>

              {/* FAQ Content */}
              <div className="lg:col-span-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Category Header */}
                    {selectedCategory !== "all" &&
                      faqCategories[selectedCategory] && (
                        <div className="mb-8 animate-fade-in">
                          <div className="flex items-center gap-3 mb-4">
                            {React.createElement(
                              iconMap[faqCategories[selectedCategory].icon] ||
                                HelpCircle,
                              {
                                className: "h-6 w-6 text-orange-500",
                              }
                            )}
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                              {faqCategories[selectedCategory].title}
                            </h2>
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">
                            {filteredQuestions.length} soru bulundu
                          </p>
                        </div>
                      )}

                    {/* Questions */}
                    {filteredQuestions.length > 0 ? (
                      <div className="space-y-4">
                        {filteredQuestions.map((question, index) => (
                          <div
                            key={question.id}
                            className="animate-slide-up"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <FAQItem
                              question={question.question}
                              answer={question.answer}
                              isOpen={openQuestion === question.id}
                              onToggle={() => handleQuestionToggle(question.id)}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <HelpCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          Aradığınız soru bulunamadı
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                          Farklı anahtar kelimeler deneyebilir veya bizimle
                          iletişime geçebilirsiniz.
                        </p>
                        <Button
                          asChild
                          className="bg-orange-500 hover:bg-orange-600"
                        >
                          <Link href="/iletisim">İletişime Geç</Link>
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </section>
    </div>
  );
}

export default SSSClientComponent;
