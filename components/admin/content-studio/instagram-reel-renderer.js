"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, FileText, MessageCircle } from "lucide-react";

export function InstagramReelRenderer({ content, updateContent, handleCopy }) {
  return (
    <div className="space-y-6">
      {/* Reel Concept */}
      {content.reelConcept && (
        <div className="p-4 bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl border border-pink-200">
          <p className="text-xs font-semibold text-pink-700 mb-2">
            Reel Konsepti
          </p>
          <p className="text-sm text-gray-700">{content.reelConcept}</p>
          {content.duration && (
            <p className="text-xs text-gray-500 mt-2">
              Süre: {content.duration}
            </p>
          )}
        </div>
      )}

      {/* Script Timeline */}
      {content.script && (
        <div className="space-y-4">
          <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="h-4 w-4 text-purple-500" />
            Reel Script (Timeline)
          </Label>

          {/* Hook */}
          {content.script.hook && (
            <div className="p-4 bg-yellow-50 rounded-xl border-l-4 border-yellow-400">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-yellow-500 text-white">
                  {content.script.hook.timestamp || "0-1 sn"}
                </Badge>
                <span className="text-xs font-semibold text-yellow-700">
                  HOOK
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Görsel:</strong> {content.script.hook.visual}
              </p>
              {content.script.hook.cameraAngle && (
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Kamera Açısı:</strong>{" "}
                  {content.script.hook.cameraAngle}
                </p>
              )}
              <p className="text-sm text-gray-700 mb-2">
                <strong>Ekran Metni:</strong> {content.script.hook.onScreenText}
              </p>
              {content.script.hook.audio && (
                <p className="text-xs text-gray-600">
                  <strong>Audio:</strong> {content.script.hook.audio}
                </p>
              )}
            </div>
          )}

          {/* Promise */}
          {content.script.promise && (
            <div className="p-4 bg-cyan-50 rounded-xl border-l-4 border-cyan-400">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-cyan-500 text-white">
                  {content.script.promise.timestamp}
                </Badge>
                <span className="text-xs font-semibold text-cyan-700">
                  PROMISE
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Görsel:</strong> {content.script.promise.visual}
              </p>
              {content.script.promise.transition && (
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Geçiş:</strong> {content.script.promise.transition}
                </p>
              )}
              <p className="text-sm text-gray-700 mb-2">
                <strong>Ekran Metni:</strong>{" "}
                {content.script.promise.onScreenText}
              </p>
            </div>
          )}

          {/* Value Points */}
          {content.script.valuePoints &&
            content.script.valuePoints.map((point, idx) => (
              <div
                key={idx}
                className="p-4 bg-blue-50 rounded-xl border-l-4 border-blue-400"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-blue-500 text-white">
                    {point.timestamp}
                  </Badge>
                  <span className="text-xs font-semibold text-blue-700">
                    VALUE #{idx + 1}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>{point.point}</strong>
                </p>
                <p className="text-sm text-gray-600 mb-2">{point.visual}</p>
                {point.transition && (
                  <p className="text-xs text-blue-600 mb-2">
                    <strong>Geçiş:</strong> {point.transition}
                  </p>
                )}
                <p className="text-sm font-medium text-gray-800">
                  {point.onScreenText}
                </p>
              </div>
            ))}

          {/* Payoff */}
          {content.script.payoff && (
            <div className="p-4 bg-green-50 rounded-xl border-l-4 border-green-400">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-green-500 text-white">
                  {content.script.payoff.timestamp}
                </Badge>
                <span className="text-xs font-semibold text-green-700">
                  PAYOFF
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Görsel:</strong> {content.script.payoff.visual}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Ekran Metni:</strong>{" "}
                {content.script.payoff.onScreenText}
              </p>
              {content.script.payoff.loopability && (
                <p className="text-xs text-gray-600 italic">
                  Loop: {content.script.payoff.loopability}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Audio Suggestions */}
      {content.audioSuggestions && (
        <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
          <p className="text-xs font-semibold text-purple-700 mb-3">
            Audio Önerileri
          </p>
          {content.audioSuggestions.original && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 mb-1">Orijinal Ses:</p>
              <p className="text-sm text-gray-700">
                {content.audioSuggestions.original}
              </p>
            </div>
          )}
          {content.audioSuggestions.trending &&
            content.audioSuggestions.trending.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-gray-600 mb-1">Trending:</p>
                <div className="flex flex-wrap gap-2">
                  {content.audioSuggestions.trending.map((audio, idx) => (
                    <Badge key={idx} variant="secondary">
                      {audio}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          {content.audioSuggestions.voiceoverScript && (
            <p className="text-sm text-gray-700 mt-2">
              <strong>Voiceover:</strong>{" "}
              {content.audioSuggestions.voiceoverScript}
            </p>
          )}
        </div>
      )}

      {/* Shooting Notes */}
      {content.shootingNotes && (
        <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <p className="text-xs font-semibold text-orange-700 mb-3">
            Çekim Notları
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            {content.shootingNotes.location && (
              <p>
                <strong>Lokasyon:</strong> {content.shootingNotes.location}
              </p>
            )}
            {content.shootingNotes.equipment && (
              <p>
                <strong>Ekipman:</strong> {content.shootingNotes.equipment}
              </p>
            )}
            {content.shootingNotes.lighting && (
              <p>
                <strong>Işık:</strong> {content.shootingNotes.lighting}
              </p>
            )}
            {content.shootingNotes.props && (
              <p>
                <strong>Props:</strong> {content.shootingNotes.props}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Reel Caption */}
      {content.captionForReel && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-pink-500" />
              Reel Caption
            </Label>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleCopy(content.captionForReel)}
            >
              <Copy className="w-4 h-4 mr-1" />
              Kopyala
            </Button>
          </div>
          <Textarea
            value={content.captionForReel}
            onChange={(e) => updateContent("captionForReel", e.target.value)}
            rows={3}
            className="border-pink-200 bg-pink-50 focus:border-pink-500 rounded-xl resize-none"
            placeholder="Reel için caption..."
          />
          <p className="text-xs text-gray-500">
            {content.captionForReel?.length || 0} karakter
          </p>
        </div>
      )}

      {/* Editing Notes */}
      {content.editingNotes && (
        <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-200">
          <p className="text-xs font-semibold text-indigo-700 mb-3">
            Düzenleme Notları
          </p>
          <div className="space-y-2 text-sm text-gray-700">
            {content.editingNotes.software && (
              <p>
                <strong>Yazılım:</strong> {content.editingNotes.software}
              </p>
            )}
            {content.editingNotes.effects && (
              <div>
                <p className="font-semibold mb-2">Efektler:</p>
                {Array.isArray(content.editingNotes.effects) ? (
                  <ul className="list-disc list-inside space-y-1">
                    {content.editingNotes.effects.map((effect, idx) => (
                      <li key={idx}>{effect}</li>
                    ))}
                  </ul>
                ) : (
                  <p>{content.editingNotes.effects}</p>
                )}
              </div>
            )}
            {content.editingNotes.colorGrade && (
              <p>
                <strong>Renk:</strong> {content.editingNotes.colorGrade}
              </p>
            )}
            {content.editingNotes.pacing && (
              <p>
                <strong>Tempo:</strong> {content.editingNotes.pacing}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Expected Performance */}
      {content.expectedPerformance && (
        <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
          <p className="text-xs font-semibold text-emerald-700 mb-2">
            Beklenen Performans
          </p>
          <p className="text-sm text-gray-700">{content.expectedPerformance}</p>
        </div>
      )}
    </div>
  );
}
